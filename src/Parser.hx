typedef Token = {
    var literal : String;
    var line : Int;
    var type : String;
}

class Parser {
    //
    public static function parse(src : String) {
        src = StringTools.replace(src, '\r', '');
        var hasError = false;
        var start = 0;
        var current = 0;
        var line = 1;
        var tokens : Array<Token> = [];
        var indent = "";
        var symbols = [':', '+', '-', '*', '/', '%', '<', '>', '=', '"', '.', ',', '[', ']', '#'];
        var symbols2 = ['<=', '>=', '==',];
        function addToken(type : String, literal : String = null) {
            if (literal == null){
                literal = src.substr(start, current - start);
            }
            var token = {
                literal: literal,
                line: line,
                type: type
            }
            tokens.push(token);
            return token;
        }
        function error(msg:String) {
            hasError = true;
            trace("error on line " + line + ": " + msg);
        }
        function isWhitespace(c:String) {
            return c == ' ' || c == '\t' || c == '\r';
        }
        function isDigit(c:String) {
            var code = c.charCodeAt(0);
            return code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0);
        }
        function comment() {
            var c = src.charAt(current);
            if (c != '#') return false;
            while ( c != '\n' && current < src.length) {
                current++;
                c = src.charAt(current);
            }
            return true;
        }
        function whitespace() {
            var c = src.charAt(current);
            if (!isWhitespace(c)){
                return false;
            }
            if(current == 0){
                error("indentation error");
                return true;
            }
            while ( isWhitespace(c) && current < src.length) {
                current++;
                c = src.charAt(current);
            }
            //trace(src.charAt(start - 1) == '\n');
            if (src.charAt(start - 1) != '\n'){
                return true;
            }
            //if (current == src.length) {current--;}
            var str = src.substr(start, current - start);
            if(indent == ""){
                indent = str;
            }
            //trace(str.length);
            while(StringTools.startsWith(str, indent)){
                addToken("Indent", "Indent");
                str = str.substr(indent.length);
            }
            if(str.length > 0){
                //trace("indent error on line " + line);
                error("indentation error");
            }
            return true;
        }
        function string() {
            var c = src.charAt(current);
            if(c != '"'){
                return false;
            }
            do{
                current++;
                c = src.charAt(current);
            }
            while ( c != '"' && current < src.length);
            var str = src.substr(start + 1, current - start - 1);
            current++;
            addToken("String", str);
            return true;
        }
        function ident() {
            function isValidChar(c:String) {
                //trace(c);
                if(c == '')return false;
                if(c == '\n')return false;
                if(isWhitespace(c))return false;
                if(isDigit(c))return false;
                if(symbols.contains(c))return false;
                return true;
            }
            var c = src.charAt(current);
            while (isValidChar(c) && current < src.length){
                current++;
                c = src.charAt(current);
            }
            if(current == start){return false;}
            //current--;
            var token = addToken("Ident");
            token.literal = token.literal.toLowerCase();
            return true;
        }
        function symbol() {
            //trace(current < src.length - 1);
            if (current < src.length - 1){
                var s = src.substr(current, 2);
                //trace(s);
                if (symbols2.contains(s)){
                    current += 2;
                    addToken("Symbol");
                    return true;
                }
            }
            var c = src.charAt(current);
            if (symbols.contains(c)){
                current++;
                addToken("Symbol");
                return true;
            }
            return false;
        }
        function number() {
            var c = src.charAt(current);
            if (!isDigit(c)) return false;
            var hasDecimal = false;
            while(current < src.length){
                if (isDigit(c) || c == '_'){
                    current++;
                }
                else if(c == '.'){
                    if (hasDecimal){
                        error("more than one decimal in number!");
                        return true;
                    }
                    hasDecimal = true;
                    current++;
                }
                else{
                    break;
                }
                c = src.charAt(current);
            }
            var token = addToken("Number");
            token.literal = StringTools.replace(token.literal, "_", "");
            if(token.literal.charAt(token.literal.length - 1) == '.'){token.literal+="0";}
            return true;
        }
        var i = 0;
        while (current < src.length && !hasError){
            if(src.charAt(current) == '\n'){
                current++;
                addToken("Newline", "NewLine");
                line++;
            }
            else if(comment()){}
            else if(string()){}
            else if(whitespace()){}
            else if(number()){}
            else if(symbol()){}
            else if(ident()){}
            else{current++;}
            start = current;
            i++;
            //if (i == 3) break;
            // var c = src.charAt(current);
            // current++;
            // switch c {
            //     case '\n':
            //         addToken(TokenType.Newline);
            //     case ' ':
            //         whitespace();
            //     case '\t':
            //         whitespace();
            //     case '"':
            //         string();
            //     default:
            //         ident();
            // }
            // start = current;
        }
        return tokens;
    }
}