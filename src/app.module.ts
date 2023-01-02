import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { NestPgModule } from 'nest-pg';
import { ImportExportFileModule } from './import-export-file/import-export-file.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    NestPgModule.register({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DATABASE,
      password: process.env.POSTGRES_PASSWORD,
    }),
    ImportExportFileModule,
  ],
  controllers: [],
  providers: [],
})
export default class AppModule {}
