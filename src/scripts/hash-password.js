const bcrypt = require('bcryptjs');
const password = 'admin123'; // Altere para a senha desejada
const hash = bcrypt.hashSync(password, 10);
console.log('Hash:', hash);