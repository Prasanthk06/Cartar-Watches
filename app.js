const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/stylesheets',express.static(path.join(__dirname,'stylesheets')))
app.use('/images',express.static(path.join(__dirname,'images')))
app.use('/javascripts',express.static(path.join(__dirname,'javascripts')))

const usersFilePath = path.join(__dirname, 'review.json');
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Admin.html'));
});

app.get('/public/:pages',(req,res)=>
{
    const page = req.params.pages;
    res.sendFile(path.join(__dirname,'public',page))
})
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
            users.push({ name, email, password: hashedPassword });

            fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to users file:', err);
                    return res.status(500).send('Error writing to users file');
                }

                res.send('Signup data submitted successfully');
            });
        });
    } catch (err) {
        console.error('Error processing signup:', err);
        res.status(500).send('Error processing signup');
    }
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

        res.send('Login successful');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on https://cartar-watches.onrender.com`);
});