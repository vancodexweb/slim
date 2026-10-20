import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1792533982870 implements MigrationInterface {
  name = 'Init1792533982870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Нужно для uuid_generate_v4() в значениях по умолчанию
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "gifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text NOT NULL, "category" character varying(100) NOT NULL, "price" numeric(10,2) NOT NULL, "tier" character varying(20) NOT NULL, "rating" numeric(2,1) NOT NULL DEFAULT '0', "imageUrl" text NOT NULL, CONSTRAINT "CHK_4e35fe2516ef87d1abc081193c" CHECK ("rating" >= 0 AND "rating" <= 5), CONSTRAINT "PK_54242922934e1f322861d116af7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerName" character varying(100) NOT NULL, "customerEmail" character varying(255) NOT NULL, "recipient" character varying(255) NOT NULL, "comment" text, "totalAmount" numeric(12,2) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "giftId" uuid NOT NULL, "price" numeric(10,2) NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "CHK_a494bfcd03bfc44425a26c4b75" CHECK ("quantity" >= 1), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_2b970c7f3efc9a66f75cdeadf98" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_2b970c7f3efc9a66f75cdeadf98"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "gifts"`);
  }
}
