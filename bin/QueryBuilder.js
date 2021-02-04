function QueryBuilder(schema=null) {

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
        const space = selectConfigs.prettyPrint === true ? '\n' : ' ' 
        if(typeof selectConfigs !== 'object' || selectConfigs === null) selectConfigs = {};
        if(selectConfigs.whereAnd === undefined) selectConfigs.whereAnd = true;
        const select = `SELECT ${selectColumns((selectConfigs.select || null), table)}`
        const from = `FROM ${schema ? `${schema}.` : ''}${table}`
        const { join, joinColumns } = selectConfigs.join ? this.join(selectConfigs.join) : { join: '', joinColumns: '' }
        const where = selectConfigs.where ? this.where(selectConfigs.where, selectConfigs.whereAnd) : ''
        const having = selectConfigs.having ? this.where(selectConfigs.having).replace('WHERE', 'HAVING') : ''
        const group = selectConfigs.group ? `GROUP BY ${selectConfigs.group}` : ''
        const order = selectConfigs.order ? `ORDER BY ${selectConfigs.order}` : ''
        const limit = selectConfigs.limit ? `LIMIT ${selectConfigs.limit}` : ''
        const offset = selectConfigs.offset ? `OFFSET ${selectConfigs.offset}` : ''
        const queryParts = [
            select,
            joinColumns,
            from,
            join,
            where,
            group,
            having,
            order,
            limit,
            offset
        ]
        const query = queryParts.join(space).replace(/\s\s+/g, ' ')
        return query
    }
    this.insert = (table, row) => {
        const columns = `(${Object.keys(row).join(',')})`
        const values = `VALUES(${Object.values(row).map(esc).join(',')})`
        const query = `
        INSERT INTO ${schema ? `${schema}.`: ''}${table} ${columns} ${values}
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
                const from = `${joinObject.schema || schema ? `${joinObject.schema || schema}.` : ''}${joinObject.table || defaultTable}`
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
    this.setSchema = (newSchema) => {
        if(newSchema && typeof newSchema === 'string') {
            schema = newSchema
        } else {
            schema = null
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
        
        if (value.includes('__BETWEEN__')) {
            const [begin, end] = value.split('__BETWEEN__');
            return `(${key} BETWEEN ${begin} AND ${end})`;
        }
        let operator = '='
        const operators = ['=', '>=', '<=', '<>', '>', '<', '!=', 'LIKE', 'IS']
        for (const operation of operators) {
            if (value.startsWith(`__${operation}__`)) {
                if(operation === 'IS') {
                    value = value.replace(`__${operation}__`, '__EXPRESSION__')
                } else {
                    value = value.replace(`__${operation}__`, '')
                }
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
            return value.replace(/__EXPRESSION__/g, '')
        }
        return `'${value}'`
    }

    this.setSchema(schema)

}

module.exports = QueryBuilder

