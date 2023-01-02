import { Inject, Injectable } from '@nestjs/common';
import { PgConnection, NestPgPool } from 'nest-pg';
import { parse } from 'csv-parse';
import { join } from 'path';
import { faker } from '@faker-js/faker';
import { ClientProxy } from '@nestjs/microservices';
import * as EasyYandexS3 from 'easy-yandex-s3';
import * as fs from 'fs';
import * as parserToCsv from 'json2csv';
import * as dotenv from 'dotenv';
import { on } from 'events';
import { async } from 'rxjs';

dotenv.config();

const keyId = process.env.KEY_ID;
const privateKey = process.env.PRIVATE_KEY;

const s3 = new EasyYandexS3({
  auth: {
    accessKeyId: keyId,
    secretAccessKey: privateKey,
  },
  Bucket: 'cars-list',
  debug: false,
});

function createRandomCar() {
  return {
    id: faker.datatype.uuid(),
    carbrand: faker.vehicle.manufacturer(),
    statenumber: faker.datatype.number({ min: 100, max: 999 }),
  };
}

@Injectable()
export class ImportExportFileService {
  constructor(@PgConnection() private readonly db: NestPgPool, @Inject('IMPORT_EXPORT_SERVICE') private readonly client: ClientProxy,) {}

  async getFile() {
    const writeableStream = fs.createWriteStream('list.car.csv');
    writeableStream.write('id;carbrand;statenumbe\n');
    for (let index = 0; index <= 310; index += 1) {
      const carInfo = createRandomCar();
      writeableStream.write(
        `${carInfo.id};${carInfo.carbrand};${carInfo.statenumber}\n`,
      );
    }
    const arrayCars = [];
    const readStream = fs.createReadStream('list.car.csv');

    readStream
        .pipe(parse({ delimiter: ';', from_line: 2 }))
        .on('data', async (row) => {
          if (arrayCars.length <= 100) {
            arrayCars.push(
              `('${row[0].trim()}', '${row[1].trim()}', '${row[2].trim()}')`,
            );
          }
          if (arrayCars.length === 100) {
            const newArr = Object.assign([], arrayCars);
            
             this.client.emit('import-data', newArr);
             arrayCars.length = 0;
          }
        })
        .on('end', () =>  this.client.emit('import-data', arrayCars))
        .on('error', (error) => {
          console.log(error.message);
        });
        
  }

  async createFile() {
    const carsList = await this.db.rows('select * from car');

    const convertToCsv = parserToCsv.parse(carsList);

    const link = await new Promise((resolve) => {
      fs.writeFile('new-list-car.csv', convertToCsv, () => resolve(
        s3.Upload(
          {
            path: join(process.cwd(), 'new-list-car.csv'),
          },
          '/cars/',
        ),
      ));
    });

    return link['Location'];
  }
}
