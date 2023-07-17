function getDateComponents(dateString) {
  const stringComps = dateString.split("-");

  if (stringComps.length != 3) {
    return null;
  }
  

  try {
    const year = parseInt(stringComps[0]);
    const month = parseInt(stringComps[1]);
    const day = parseInt(stringComps[2]);

    console.log(year,month,day)

    const date = new Date(year, month-1, day);

    console.log(date.getDay())

    const response = {
      diaSemana: convertFromDayIntToString(date.getDay()),
      diaNumero: date.getDate(),
      mes: date.getMonth()+1,
      year: date.getFullYear(),
    };

    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function convertFromDayIntToString(dayCode) {
  switch (dayCode) {
    // 0 domingo - 6 sabado
    case 0:
      return "domingo";

    case 1:
      return "lunes";

    case 2:
      return "martes";

    case 3:
      return "miercoles";

    case 4:
      return "jueves";

    case 5:
      return "viernes";

    case 6:
      return "sabado";

    default:
      return null;
  }
}

function convertFromMonthIntToString(monthCode) {
  switch (monthCode) {
    case 1:
      return "enero";

    case 2:
      return "febrero";

    case 3:
      return "marzo";

    case 4:
      return "abril";

    case 5:
      return "mayo";

    case 6:
      return "junio";

    case 7:
      return "julio";

    case 8:
      return "agosto";

    case 9:
      return "setiembre";

    case 10:
      return "octubre";

    case 11:
      return "noviembre";

    case 12:
      return "diciembre";

    default:
      return null;
  }
}

export {getDateComponents, convertFromDayIntToString, convertFromMonthIntToString}