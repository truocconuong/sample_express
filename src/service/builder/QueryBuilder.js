const Sequelize = require('sequelize');
const _ = require('lodash');

const { Op } = Sequelize;

class QueryBuilder {
  constructor() {
    this.condition = {};
  }

  searchQueryParams(attributes, value) {
    const { or } = Op;
    if (!this.condition[or]) {
      this.condition[or] = [];
    }
    attributes.map((atrribute) => {
      const where = {
        [atrribute]: {
          [Op.like]: `${value}%`,
        },
      };
      this.condition[or].push(where);
      return atrribute;
    });
  }

  where(column, condition, value) {
    if (
      _.isUndefined(column)
      || _.isUndefined(condition)
      || _.isUndefined(value)
    ) {
      throw new Error(
        'you need to pass the full three parameters column, condition, value',
      );
    } else {
      const operator = this.getCondition(condition);
      this.condition[column] = {
        [operator]: value,
      };
    }
  }

  generateQuery() {
    return this.condition;
  }

  getCondition(condition) {
    console.log(this.condition);
    switch (condition) {
      case '=':
        return Op.eq;
      case 'like':
        return Op.like;
      case 'or':
        return Op.or;
      case 'in':
        return Op.in;
      case 'between':
        return Op.between;
      case '!=':
        return Op.ne;
      default:
        return Op.eq;
    }
  }
}

module.exports = QueryBuilder;
