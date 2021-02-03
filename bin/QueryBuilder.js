function QueryBuilder(schema=null) {
    this.schema = schema
    this.where = (whereFilter, and = true) => {
        if (typeof whereFilter === 'string') {
            return `WHERE ${whereFilter}`
        } else if (Array.isArray(whereFilter)) {
            return `WHERE ${whereFilter.join(and ? ' AND ' : ' OR ')}`
        } else if (typeof whereFilter === 'object' && whereFilter !== null) {
            return `WHERE ${buildWhereArrayFromObject(whereFilter).join(and ? ' AND ' : ' OR ')}`
        } else {
            return ""
        }
    }
    this.select = (table, selectConfigs={}) => {
        if(typeof selectColumns !== 'object' || selectColumns === null) selectColumns = {};
        const select = `SELECT ${selectColumns((selectConfigs.select || null), table)}`
        const from = `FROM ${this.schema ? `${this.schema}.` : ''}${table}`
        const { join, joinColumns } = selectConfigs.join ? this.join(selectConfigs.join) : { join: '', joinColumns: '' }
        const where = selectConfigs.where ? this.where(selectConfigs.where) : ''
        const having = selectConfigs.having ? this.where(selectConfigs.having).replace('WHERE', 'HAVING') : ''
        const group = selectConfigs.group ? `GROUP BY ${selectConfigs.group}` : ''
        const order = selectConfigs.order ? `ORDER BY ${selectConfigs.order}` : ''
        const limit = selectConfigs.limit ? `LIMIT ${selectConfigs.limit}` : ''
        const offset = selectConfigs.offset ? `OFFSET ${selectConfigs.offset}` : ''
        const query = `${select}${joinColumns} ${from} ${join} ${where} ${group} ${having} ${order} ${limit} ${offset}`.replace(/\s\s+/g, ' ')
        return query
    }
    this.insert = (table, row) => {
        const columns = `(${Object.keys(row).join(',')})`
        const values = `VALUES(${Object.values(row).map(esc).join(',')})`
        const query = `
            INSERT INTO ${this.schema ? `${this.schema}.`: ''}${table} ${columns} ${values}
        `
        return query
    }
    this.join = (join, defaultTable=null) => {
        if (typeof join === 'string') {
            return { join: join, joinColumns: null }
        } else if (Array.isArray(join) || (typeof join === 'object' && join !== null)) {
            if (typeof join === 'object' && join !== null && !Array.isArray(join)) {
                join = [join]
            }
            const result = join.map(joinObject => {
                if ((!joinObject.table && !defaultTable) || !joinObject.on) {
                    return { join: null, joinColumns: null }
                }
                const from = `${joinObject.schema || this.schema ? `${joinObject.schema || this.schema}.` : ''}${joinObject.table || defaultTable}`
                const joinColumns = joinObject.select !== undefined && joinObject.select !== {} ? joinObject.select : null
                const join = `${(joinObject.type || 'INNER').toUpperCase()} JOIN ${from} ON ${joinObject.on}`
                return { join, joinColumns }
            })
            const joins = result.map(join => join.join)
            const joinColumns = result.map(join => join.joinColumns).filter(join => join !== null).map(selectColumns)
            return {
                join: joins.join(' '),
                joinColumns: joinColumns.length !== 0 ? `,${joinColumns.join(',')}` : ''
            }
        } else {
            return { join: null, joinColumns: null }
        }
    }

    function selectColumns(select, table) {
        let columns;
        if (typeof select === 'string') {
            columns = select
        } else if (Array.isArray(select)) {
            columns = select.join(',')
        } else if (typeof select === 'object' && select !== null) {
            columns = Object.entries(select).map(([key, val]) => {
                return `${val} as ${key}`
            }).join(',')
        } else {
            columns = `${table ? `${table}.` : ''}*`
        }
    
        return columns
    }
    
    function buildWhereArrayFromObject(object) {
        const result = Object.entries(object).map(([key, value]) => {
            if (key === '__EXPRESSION__') {
                return value
            }
            if (typeof value === 'number') {
                return `${key} = ${value.toString()}`;
            } else if (typeof value === 'string') {
                return buildCondition(key, value);
            } else if (Array.isArray(value)) {
                return `${key} IN (${value.map(esc).join(',')})`
            }
        })
        return result;
    }
    
    function buildCondition(key, value) {
    
        if (value.includes('..')) {
            const [begin, end] = value.split('..');
            return `(${key} BETWEEN ${begin} AND ${end})`;
        }
        let operator = '='
        const operators = ['=', '>=', '<=', '<>', '>', '<', '!=', 'LIKE', 'IS']
        for (const operation of operators) {
            if (value.startsWith(`__${operation}__`)) {
                value = value.replace(`__${operation}__`, '')
                operator = operation
                break;
            }
        }
        if (value.includes('__%__') || value.includes('__?__')) {
            value = value.replace(/__%__/g, '%').replace(/__\?__/g, '_');
        }
        return `${key} ${operator} ${esc(value)}`;
    }
    
    function esc(value) {
        if (!isNaN(value)) {
            return value
        } else if(typeof value === 'string' && value.startsWith('__EXPRESSION__')) {
            return value.replace('__EXPRESSION__', '')
        }
        return `'${value}'`
    }
}

module.exports = QueryBuilder

