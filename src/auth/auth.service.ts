import {ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {LoginDto, RegisterDto} from './dto/auth.dto';
import { Profile } from './entities/profile.entity';
import * as argon2 from 'argon2';
import {JwtService} from "@nestjs/jwt";
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        private dataSource: DataSource,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const existingProfile = await this.profileRepository.findOne({
            where: { phone: dto.phone },
        });
        if (existingProfile) {
            throw new ConflictException('Пользователь с таким телефоном уже существует');
        }

        const passwordHash = await argon2.hash(dto.password);

        return this.dataSource.transaction(async (manager) => {
            const user = manager.create(User, {
                email: dto.email,
                password: passwordHash,
            });
            await manager.save(user);

            const profile = manager.create(Profile, {
                firstName: dto.firstName,
                lastName: dto.lastName,
                middleName: dto.middleName ?? null,
                phone: dto.phone,
                userId: user.id,
            });
            await manager.save(profile);

            return {
                message: 'Пользователь успешно зарегистрирован'
            };
        });
    }

    async login(dto: LoginDto) {
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        const isPasswordValid = await argon2.verify(user.password, dto.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        const payload: JwtPayload = { sub: user.id };
        const accessToken = await this.jwtService.signAsync(payload);
        const { exp } = this.jwtService.decode<{ exp: number }>(accessToken);

        return {
            accessToken,
            expiresAt: new Date(exp * 1000),
        };
    }

    async getMe(userId: string) {
        const user = await this.userRepository.findOneByOrFail({ id: userId });
        const profile = await this.profileRepository.findOneByOrFail({ userId });

        return {
            id: user.id,
            email: user.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            middleName: profile.middleName,
            phone: profile.phone,
            avatarUrl: profile.avatarUrl,
        };
    }
}