# mysql-query-builder
 
Lib for generating mysql queries.

# SELECT

```js
const queryBuilder = new (require('./bin/QueryBuilder'))

const query = queryBuilder.select('client', {
    select: '*',
    join: {
        table: 'client_document',
        on: 'client.id = client_document.clientId',
        select: {
            clientDocumentId: 'cliente_document.id',
            clientDocumentFile: 'CONCAT(client_document.name, ".", client_document.extension)',
        },
        type: 'left',
    },
    where: {
        'client.id': 1,
        'client.name': '__LIKE__sim__?__son__%__',
        'client.isHappy': '__IS__NOT FALSE',
        birthDate: '"2020-5-10"__BETWEEN__"2021-1-1"',
        clientScore: '__>__300',
        'client_document.number': [1,2,3,4,5, '2B']
    },
    group: 'cliente_document.id',
    having: {
        clientDocumentFile: '__LIKE____%__.txt'
    },
    order: 'client.id DESC, client_document.id ASC',
    limit: 10,
    offset: 30,
    prettyPrint: true,
})

console.log(query);

```
* Output
```output
SELECT *
,cliente_document.id as clientDocumentId,CONCAT(client_document.name, ".", client_document.extension) as clientDocumentFile
FROM client
LEFT JOIN client_document ON client.id = client_document.clientId
WHERE client.id = 1 AND client.name LIKE 'sim_son%' AND client.isHappy IS NOT FALSE AND (birthDate BETWEEN "2020-5-10" AND "2021-1-1") AND clientScore > 300 AND client_document.number IN (1,2,3,4,5,'2B')
GROUP BY cliente_document.id
HAVING clientDocumentFile LIKE '%.txt'
ORDER BY client.id DESC, client_document.id ASC
LIMIT 10
OFFSET 30
```

