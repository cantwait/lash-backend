const { forEach, reduce } = require('lodash');

exports.recalculatesubTotal = async (services, discount) => {
  let subTotal = 0;
  if (services.length > 0) {
    console.log('calculating subTotal...');
    const accum = (sum, s) => sum + s.price;
    subTotal = reduce(services, accum, 0);
  } else {
    return 0;
  }
  return discount > 0 ? subTotal - (subTotal * discount) : subTotal;
};

exports.recalculateTotal = async (isTax, subtotal, itbms) => {
  if(isTax && itbms > 0) {
    return subtotal + itbms;
  }
};