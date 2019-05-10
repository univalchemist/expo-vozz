import CONSTANTS from '../utils/constantes';

export default function gql(query, variables = {}, baseURL = CONSTANTS.URL_API_PRE){
    if( query === undefined ){ console.log("El parámetro 'query' de la funcion gql está vacío") }
    const queryReplace = query
                    .replace(/\n/gi,   "%0A")
                    .replace(/:/gi,    "%3A")
                    .replace(/\\/gi,   "%22")
                    .replace(/ {2}/gi, "%09")
                    .replace(/ /gi,    "%20")
                    .replace(/{/gi,    "%7B")
                    .replace(/}/gi,    "%7D")
                    .replace(/\(/gi,   "%28")
                    .replace(/\)/gi,   "%29")

//    const queryUgly = queryReplace.split("$").map((elem, i) => {
    const queryUgly = queryReplace.split(/\[|\]/gi).map((elem, i) => {
        if(i%2){ //Es una variable
            return variables[elem]
        }
        else{ //No es una variable
            return elem
        }
    }).reduce((a, b) => a + b, "")
                    
    return baseURL + "/graphql?query=" + queryUgly
}