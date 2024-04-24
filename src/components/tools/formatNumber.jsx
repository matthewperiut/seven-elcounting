const formatNumber = (number) => {
  
  //wrap negative numbers in parenthesis and remove negative sign
  if (number < 0) {
    return `$(${Math.abs(number).toFixed(2)})`;
  }

  return `$${number.toFixed(2)}`; //formats numbers with $ sign and 2 decimal places
};

export default formatNumber;
