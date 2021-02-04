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
        clientScore: '__>__300'
    },
    group: 'cliente_document.id',
    having: {
        clientDocumentFile: '__LIKE____%__.txt'
    },
    order: 'client.id DESC, client_document.id ASC',
    limit: 10,
    offset: 30,
    pretyPrint: true,
})

console.log(query);