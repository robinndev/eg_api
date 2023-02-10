const express = require('express')
const cors = require('cors');
const port = 3333;

// Conexão SQL SERVER

const sql = require("mssql");

const config = {
    server: "elg-mssql-clustter.database.windows.net",
    database: "mvp",
    user: "user_admin",
    password: "vy'" + '/&=r]=wsSNKj%{?UNG@8gx6}un_AMw#ghcu`N!?6Y"utyN]7-=4`b{}Ze/J/t',
};

const dbConn = new sql.ConnectionPool(config);

dbConn
    .connect()
    .then((conn) => {
        console.log("Successfully connected to the database");
        conn.close();
    })
    .catch((err) => console.log("Error connecting to the database", err));


// _____________________________________________________________

const app = express();
app.use(cors());

sql.connect(`Server=${config.server};Database=${config.database};User Id=${config.user};Password=${config.password}`)
    .then(conn => global.conn = conn)
    .catch(err => console.log(err));

app.listen(port, () => console.log('Server running or port 3333'));

app.get('/search/:link', (request, response) => {
    const { link } = request.params;
    console.log(link)
    execSQLQuery(`DECLARE @return_value int, @saida nvarchar(max) EXEC	@return_value = [dbo].[SP_PESQUISA_PLACA] ${link}, @saida = @saida OUTPUT SELECT @Saida as N'@Saida' SELECT 'Return Value' = @return_value`, response);
});

function execSQLQuery(sqlQry, res) {
    global.conn.request()
        .query(sqlQry)
        .then(result => {
            const original = result.recordset[0]["@Saida"];
            const arrayCleanedBubble = original.replace(/BOLHA \d+;/g, '');

            const string = arrayCleanedBubble;

            const arr = string.split(';');
            
            const resultOrganized = arr.map((item, index) => {
              if (index % 2 === 0) {
                return {
                  text: item,
                  value: arr[index + 1],
                };
              }
            }).filter(Boolean);
            
            res.json(resultOrganized)
        })
        .catch(err => console.log(err));
}