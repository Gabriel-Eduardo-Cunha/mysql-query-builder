const queryBuilder = new (require('./bin/QueryBuilder'))

const query = queryBuilder.select('client', {
    select: undefined,
    group: null
})
/*
const query = queryBuilder.insert( 'client', {
    id: '3',
    col: 'hf43934',
    col2: '3.4',
    col3: '.9',
    col4: '__EXPRESSION__(SELECT id FROM client WHERE client.name LIKE "roberto")',
    column1: null,
    column2: undefined,
    column3: '',
    column4: '   3',
    column5: '       ',
    column6: '\n\n3.5'
})

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
*/
console.log(query);