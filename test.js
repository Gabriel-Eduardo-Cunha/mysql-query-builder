const queryBuilder = new (require('./bin/QueryBuilder'))

const query = queryBuilder.select('cliente', {
    select: 'id'
})

console.log(query);