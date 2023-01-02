import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ImportExportFileService } from './import-export-file.service';

@Controller('import-export-file')
export class ImportExportFileController {
  constructor(
    private importExportFileService: ImportExportFileService,
    @Inject('IMPORT_EXPORT_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get('import-file')
  async readFile() {
    const cars = await this.importExportFileService.getFile();

    this.client.emit('import-data', cars);
  }

  @Get('export-file')
  async createFile() {
    const result = await this.importExportFileService.createFile();

    this.client.emit('export-data', result);

    return result;
  }
}
