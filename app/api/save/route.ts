import fs from 'fs';
import type { NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { join } from 'path';
import { Builder } from 'xml2js';

export async function POST(req: NextRequest, res: NextApiResponse) {

  console.log(req);
  if (req.method === 'POST') {
    const { columns, rows } = await req.json();

    console.log("C", columns);
    console.log("R", rows);

    const builder = new Builder();
    const xmlObj = {
      root: {
        data: rows.map((row: any) => {
          const dataObj: { [key: string]: string } = {};
          columns.forEach((col: any) => {
            if (col.field !== 'id') {
              dataObj[col.field] = Array.isArray(row[col.field]) ? row[col.field][0] : row[col.field];
            }
          });
          return dataObj;
        }),
      },
    };

    const xml = builder.buildObject(xmlObj);
    // console.log(xml);

    const filePath = join(process.cwd(), 'data.xml');
    // console.log(filePath);

    try {
      fs.writeFileSync(filePath, xml);
      res.status(200).send('XMLファイルを保存しました');
    } catch (error) {
      console.error('XMLファイルの保存に失敗しました:', error);
      res.status(500).json({ error: 'XMLファイルの保存に失敗しました', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
