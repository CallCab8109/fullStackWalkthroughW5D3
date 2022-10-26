const Sequelize = require('sequelize')
const CONNECTION_STRING = process.env.CONNECTION_STRING

const userId = 4
const clientId = 3

const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

module.exports = {
    getUserInfo: (req, res) => {
        sequelize.query(`
            SELECT * FROM cc_clients AS c
                JOIN cc_users AS u
                ON cc_clients.user_id = cc_users.user_id
                WHERE cc_users.user_id = ${userId};
        `)
        .then((dbRes) => {
            res.send(dbRes[0])
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send('that my friend, is an error')
        })
    },
    updateUserInfo: (req, res) => {
       let {
        firstName,
        lastName,
        phoneNumber,
        email,
        address,
        city,
        state,
        zipCode
       } = req.body
// single quotes around firstname, lastname, etc.. below are NEEDED in SQL and will cause errors
       sequelize.query(`
            UPDATE cc_users
            SET 
                first_name = '${firstName}',
                last_name = '${lastName}',
                email = '${email}',
                phone_number = ${phoneNumber}
            WHERE user_id = ${userId};

            UPDATE cc_clients
            SET
                address = '${address}',
                city = '${city}',
                state = '${state}',
                zip_code = ${zipCode}
            WHERE 
                user_id = ${userId};
       `)
       .then((dbRes) => {
            res.sendSatus(200)
       })
       .catch((err) => {
            console.log(err)
            res.status(500).send('that my friend, is an error')
    })
    },
    getUserAppt: (req, res) => {
        sequelize.query(`
            SELECT * FROM cc_appointments
            WHERE 
                client_id = ${clientId}
                ORDER BY date DESC;
        `)
        .then((dbRes) => {
            res.status(200).send(dbRes[0])
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send('that my friend, is an error') 
        })
    },
    requestAppointment: (req, res) => {
        const {date, service} = req.body

        sequelize.query(`
            INSERT INTO cc_appointments
                (client_id, date, service_type, notes, approved, completed)
            VALUES
                (${clientId}, '${date}', '${service}', '', false, false)
            RETURNING *;
        `)
        .then((dbRes) => {
            res.status(200).send(dbRes[0])
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send('that my friend, is an error') 
        })
    }
}