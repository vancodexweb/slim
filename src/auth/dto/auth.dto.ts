import {
    IsEmail, IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Некорректный email' })
    @IsNotEmpty({ message: 'Email обязателен' })
    email: string;

    @MaxLength(128, { message: 'Пароль слишком длинный' })
    @MinLength(8, { message: 'Пароль должен быть не короче 8 символов' })
    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль обязателен' })
    password: string;

    @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
    @IsString({ message: 'Имя должно быть строкой' })
    @IsNotEmpty({ message: 'Имя обязательно' })
    firstName: string;

    @MaxLength(100, { message: 'Фамилия не должна превышать 100 символов' })
    @IsString({ message: 'Фамилия должна быть строкой' })
    @IsNotEmpty({ message: 'Фамилия обязательна' })
    lastName: string;

    @MaxLength(100, { message: 'Отчество не должно превышать 100 символов' })
    @IsString({ message: 'Отчество должно быть строкой' })
    @IsOptional()
    middleName?: string;

    @Matches(/^\+?[0-9]{10,15}$/, {
        message: 'Телефон должен содержать 10–15 цифр, можно с + в начале',
    })
    @IsString({ message: 'Телефон должен быть строкой' })
    @IsNotEmpty({ message: 'Телефон обязателен' })
    phone: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Некорректный email' })
    email: string;

    @IsString()
    @MinLength(1, { message: 'Пароль обязателен' })
    password: string;
}