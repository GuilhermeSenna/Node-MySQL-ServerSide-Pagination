const express = require('express');
const db = require('./connection');

const app = express();
//Static Folder
app.use(express.static('public'));
//EJS
app.set('view engine', 'ejs');

//How many posts we want to show on each page
const resultsPerPage = 10;

app.get('/', (req, res) => {
    let sql = 'SELECT * FROM photos';
    db.query(sql, (err, result) => {
        if (err) throw err;
        const numOfResults = result.length;                              // Número de resultados
        const numberOfPages = Math.ceil(numOfResults / resultsPerPage);  // Obtém o número de páginas dividindo [...]
        //                                                               // [...] os resultados totais pelo limite de resultados por página
        let page = req.query.page ? Number(req.query.page) : 1;          // Página atual

        if (page > numberOfPages) {                                      // Página escolhida for maior do que a maior POSSÍVEL
            res.redirect('/?page=' + encodeURIComponent(numberOfPages)); // Redireciona para última página
            return (null);                                               // Evitar erro "ERR_HTTP_HEADERS_SENT"
        } else if (page < 1) {                                           // Página escolhida for menor do que a menor POSSÍVEL
            page = 1;                                                    // Necessário para não dar erro no MySQL (Dar limites negativos)
            res.redirect('/?page=' + encodeURIComponent('1'));           // Redireciona para primeira página
            return (null);                                               // Evitar erro "ERR_HTTP_HEADERS_SENT"
        }

        const startingLimit = (page - 1) * resultsPerPage;                     // Determina o limite inicial para Query do MySQL
        sql = `SELECT * FROM photos LIMIT ${startingLimit},${resultsPerPage}`; // Pega o(s) número(s) relevante(s) de post(s) para página

        db.query(sql, (err, result) => {
            if (err) throw err;
            let iterator = (page - 3) < 1 ? 1 : page - 3;
            let endingLink = (iterator + 9) <= numberOfPages ? (iterator + 9) : page + (numberOfPages - page);

            if (endingLink < (page + 4)) {
                iterator -= (page + 4) - numberOfPages;              // Gerando valores negativos

                // Melhorar lógica
                let cont = 4;
                while ((page - cont - numberOfPages) < 1) {
                    cont -= 1;
                    if (cont == 0) {
                        iterator = 1;
                        break;
                    }
                }
                // iterator = 1                                            // Isso limita a menor página ser 1 (o certo)
            }

            res.render('index', { data: result, page, iterator, endingLink, numberOfPages });
        });
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server has started on PORT 3000');
});