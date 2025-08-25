import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { createObjectCsvStringifier } from 'csv-writer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async findBatch(offset: number, batchSize: number): Promise<UserEntity[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.id', 'ASC')
      .skip(offset)
      .take(batchSize)
      .getMany();
  }

  generateCsvHeader(): string {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: '名前' },
        { id: 'email', title: 'メールアドレス' },
        { id: 'age', title: '年齢' },
        { id: 'created_at', title: '作成日時' },
      ],
    });

    return csvStringifier.getHeaderString() || '';
  }

  convertUsersToCSVRows(users: UserEntity[]): string {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: '名前' },
        { id: 'email', title: 'メールアドレス' },
        { id: 'age', title: '年齢' },
        { id: 'created_at', title: '作成日時' },
      ],
    });

    // データを整形
    const records = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age || '',
      created_at: user.updatedAt.toISOString().slice(0, 19).replace('T', ' '),
    }));

    // CSV行のみを生成（ヘッダーは除く）
    return csvStringifier.stringifyRecords(records);
  }

  async *generateStreamingCsvData(batchSize: number = 1000) {
    console.log('=== ストリーミングCSV生成開始 ===');

    let offset = 0;
    let isFirstBatch = true;

    while (true) {
      // バッチでデータを取得
      const users = await this.findBatch(offset, batchSize);

      // データがない場合は終了
      if (users.length === 0) {
        console.log('データ取得完了: 件数 0');
        break;
      }

      let csvChunk = '';

      // 最初のバッチの場合はヘッダーを追加
      if (isFirstBatch) {
        csvChunk += this.generateCsvHeader();
        isFirstBatch = false;
        console.log('CSVヘッダーを追加');
      }

      // データ行を追加
      csvChunk += this.convertUsersToCSVRows(users);

      // CSVチャンクを返却
      yield csvChunk;

      // 次のバッチの準備
      offset += batchSize;

      // バッチサイズより少ない場合は最後のバッチ
      if (users.length < batchSize) {
        console.log('最後のバッチを処理完了');
        break;
      }
    }
  }

  // no use npm install library

  private escapeCsvValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // カンマ、改行、ダブルクォートが含まれている場合はダブルクォートで囲む
    if (
      stringValue.includes(',') ||
      stringValue.includes('\n') ||
      stringValue.includes('\r') ||
      stringValue.includes('"')
    ) {
      // ダブルクォートをエスケープ（""に変換）してから全体をダブルクォートで囲む
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }

    return stringValue;
  }

  generateCsvHeaderVersion2(): string {
    const headers = ['ID', '名前', 'メールアドレス', '年齢', '作成日時'];
    return (
      headers.map((header) => this.escapeCsvValue(header)).join(',') + '\n'
    );
  }

  convertUsersToCSVRowsVersion2(users: UserEntity[]): string {
    return (
      users
        .map((user) => {
          const row = [
            user.id,
            user.name,
            user.email,
            user.age || '',
            user.updatedAt.toISOString().slice(0, 19).replace('T', ' '),
          ];

          return row.map((value) => this.escapeCsvValue(value)).join(',');
        })
        .join('\n') + '\n'
    );
  }

  async *generateStreamingCsvDataVersion2(batchSize: number = 1000) {
    console.log('=== ストリーミングCSV生成開始 ===');

    let offset = 0;
    let isFirstBatch = true;

    while (true) {
      // バッチでデータを取得
      const users = await this.findBatch(offset, batchSize);

      // データがない場合は終了
      if (users.length === 0) {
        console.log('データ取得完了: 件数 0');
        break;
      }

      let csvChunk = '';

      // 最初のバッチの場合はヘッダーを追加
      if (isFirstBatch) {
        csvChunk += this.generateCsvHeader();
        isFirstBatch = false;
        console.log('CSVヘッダーを追加');
      }

      // データ行を追加
      csvChunk += this.convertUsersToCSVRows(users);

      // CSVチャンクを返却
      yield csvChunk;

      // 次のバッチの準備
      offset += batchSize;

      // バッチサイズより少ない場合は最後のバッチ
      if (users.length < batchSize) {
        console.log('最後のバッチを処理完了');
        break;
      }
    }
  }
}
