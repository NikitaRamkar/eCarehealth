/**
 * Generates random patient data for testing
 * @returns {Object} Patient object with firstName, lastName, and email
 */
export function generatePatient() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  
  const firstNames = ['Aldo', 'Alfred', 'Conrad', 'Hudson', 'Raymond', 'Jack', 'Jude', 'Wilder', 'Ames', 'Oliv','Payton','Quinn','Riley','Sullivan','Tatum','Ulysses','Vaughn','Wilder','Xavier','Yates','Zane','Baxter','Calder','Dixon','Ford','Garrison','Hammond','Irving','Jordan','Knight','Lancaster','Mann','Nolan','Owen'];
  const lastNames = ['Booker', 'Calder', 'howder', 'Cyrus', 'lane', 'Drew', 'Holland', 'hollins', 'Knight', 'Lloyd','Mann','Nolan','Owen','Parker','Quinn','Riley','Sullivan','Tatum','Ulysses','Vaughn','Wilder','Xavier','Yates','Zane'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `saurabh.kale+${firstName}.${lastName}@medarch.com`;
  
  return {
    firstName,
    lastName,
    email,
  };
}
