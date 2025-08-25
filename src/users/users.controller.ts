import { Controller, Get, Query, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('csv')
  async downloadStreamingCsv(
    @Res() res: Response,
    @Query('batchSize') batchSize?: string,
  ) {
    try {
      const batchSizeNum = batchSize ? parseInt(batchSize, 10) : 50;

      console.log(`CSVダウンロード開始: batchSize=${batchSizeNum}`);

      // レスポンスヘッダーを設定
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.setHeader('Transfer-Encoding', 'chunked');

      // BOM（Byte Order Mark）を送信してExcel対応
      res.write('\uFEFF');

      // ストリーミングでCSVデータを送信
      for await (const csvChunk of this.usersService.generateStreamingCsvData(
        batchSizeNum,
      )) {
        res.write(csvChunk);
        console.log(`CSVチャンク送信: ${csvChunk.length} 文字`);
      }

      // ストリーム終了
      res.end();
      console.log('CSVダウンロード完了');
    } catch (error) {
      console.error('CSVダウンロードエラー:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'CSV生成に失敗しました' });
      }
    }
  }

  @Get('csv-version2')
  async downloadStreamingCsvVersion2(
    @Res() res: Response,
    @Query('batchSize') batchSize?: string,
  ) {
    try {
      const batchSizeNum = batchSize ? parseInt(batchSize, 10) : 50;

      // レスポンスヘッダーを設定
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.setHeader('Transfer-Encoding', 'chunked');

      // BOM（Byte Order Mark）を送信してExcel対応
      res.write('\uFEFF');

      for await (const csvChunk of this.usersService.generateStreamingCsvDataVersion2(
        batchSizeNum,
      )) {
        res.write(csvChunk);
        console.log(`CSVチャンク送信: ${csvChunk.length} 文字`);
      }

      // ストリーム終了
      res.end();
      console.log('Version2CSVダウンロード完了');
    } catch (error) {
      console.error('CSVダウンロードエラー:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'CSV生成に失敗しました' });
      }
    }
  }
}
