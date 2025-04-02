const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const { EventEmitter } = require('events');
const { count } = require('console');
const app = express();
const PORT = 3000;

const eventEmitter = new EventEmitter();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/javascripts', express.static(path.join(__dirname, 'javascripts')));

const usersFilePath = path.join(__dirname, 'review.json');

const con = mysql.createConnection({host:'localhost',user:'root',password:'Prashanth5319',database:'Data'})

con.connect((err)=>
{
    if(err)
    {
        console.log("Error Connecting to Mysql",err);
        return;
    }

    console.log("Connected to Mysql");
})

// Event listeners
eventEmitter.on('user_signed_up', (user) => {
    console.log('New user signed up:', user);
    // You can add more logic here, such as sending a welcome email
});

eventEmitter.on('user_logged_in', (email) => {
    console.log(`User logged in: ${email}`);
    // Add more logic here, such as logging login activity
});

const query  = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
`;


con.query(query,(err,result)=>
{
    if(err)
    {
        console.log("Error Creating the table");
        return;
    }

    console.log("Table Created Successfully");
})


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Admin.html'));
});

app.get('/public/:pages', (req, res) => {
    const page = req.params.pages;
    res.sendFile(path.join(__dirname, 'public', page));
});

app.post('/submit-signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        fs.readFile(usersFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading users file:', err);
                return res.status(500).send('Error reading users file');
            }

            const users = JSON.parse(data || '[]');
            const newUser = { name, email, password: hashedPassword };
            users.push(newUser);

            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to users file:', err);
                    return res.status(500).send('Error writing to users file');
                }

            const sql = `INSERT INTO users (name,email,password) VALUES(?,?,?)`;
            con.query(sql,[newUser.name,newUser.email,newUser.password],(err,result)=>
            {
                if(err)
                {
                    console.log("Error inserting Data",err)
                    return res.render(500).send("Error inserting Data");
                }
            })

                // Emit user_signed_up event
                eventEmitter.emit('user_signed_up', newUser);

                res.send('Signup data submitted successfully');
            });
        });
    } catch (err) {
        console.error('Error processing signup:', err);
        res.status(500).send('Error processing signup');
    }
});


app.post('/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    con.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Error reading users:', err);
            return res.status(500).send('Error reading users');
        }

        if (results.length === 0) {
            return res.status(400).send('Invalid email or password');
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid current password');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE users SET password = ? WHERE email = ?';
        con.query(updateSql, [hashedNewPassword, email], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).send('Error updating password');
            }

            res.send('Password updated successfully');
        });
    });
});


app.post('/forgot-password', async (req, res) => {
    const { email, newPassword } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    con.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Error reading users:', err);
            return res.status(500).send('Error reading users');
        }

        if (results.length === 0) {
            return res.status(400).send('Invalid email');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE users SET password = ? WHERE email = ?';
        con.query(updateSql, [hashedNewPassword, email], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).send('Error updating password');
            }

            res.send('Password reset successfully');
        });
    });
});

// Endpoint to get all users (for admin page)
app.get('/users', (req, res) => {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).send('Error reading users file');
        }

        const users = JSON.parse(data || '[]');
        res.json(users);
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    fs.readFile(usersFilePath, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).send('Error reading users file');
        }

        const users = JSON.parse(data || '[]');
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid email or password');
        }

        // Emit user_logged_in event
        eventEmitter.emit('user_logged_in', email);

        res.send('Login successful');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});