import fs from 'node:fs'
import { parse } from 'csv-parse'

const csvPath = new URL('./tasks.csv', import.meta.url)
const stream = fs.createReadStream(csvPath)

const csvParse = parse({
  delimiter: ',',
  fromLine: 2,
  skipEmptyLines: true
})

async function ingestCsvFile() {
  const parsedCsv = stream.pipe(csvParse)

  for await (const row of parsedCsv) {
    const [title, description] = row

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      })
    })
  }
}

ingestCsvFile()
