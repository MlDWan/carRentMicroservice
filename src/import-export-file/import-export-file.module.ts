import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ImportExportFileService } from './import-export-file.service';
import { ImportExportFileController } from './import-export-file.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'IMPORT_EXPORT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://quvlodlr:dF96OCG_tvrqDR2j7IofsGU3XCQZSDEM@whale.rmq.cloudamqp.com/quvlodlr',
          ],
          queue: 'new',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [ImportExportFileService],
  controllers: [ImportExportFileController],
})
export class ImportExportFileModule {}
