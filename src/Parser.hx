enum TokenType {
    Str;
    Indent;
    Newline;
    Number;
    Symbol;
}

typedef Token = {
    var literal : String;
    var line : Int;
    var type : TokenType;
}

class Parser {
    //
    public static function parse(src : String) {
        var start = 0;
        var current = 0;
        var line = 1;
        var tokens : Array<Token> = [];
        var indent = "    ";
        var symbols = [':', '+', '-', '*', '/', '%', '<', '>'];
        var symbols2 = ['<=', '>=', '==',];
        function addToken(type : TokenType, literal : String = null) {
            if (literal == null){
                literal = src.substr(start, current - start);
            }
            tokens.push({
                literal: literal,
                line: line,
                type: type
            });
        }
        function whitespace() {
            var c = src.charAt(current);
            if (c != ' ' && c != '\t'){
                return false;
            }
            while ( (c == ' ' || c == '\t') && current < src.length) {
                current++;
                c = src.charAt(current);
            }
            current--;
            var str = src.substr(start, current - start);
            while(StringTools.startsWith(str, indent)){
                addToken(TokenType.Indent, indent);
                str = str.substr(indent.length);
            }
            if(str.length > 0){
                trace("indent error on line " + line);
            }
            return true;
        }
        function string() {
            var c = src.charAt(current);
            if(c != '"'){
                return false;
            }
            while ( c != '"' && current < src.length) {
                current++;
                c = src.charAt(current);
            }
            var str = src.substr(start + 1, current - start - 1);
            addToken(TokenType.Str, str);
            return true;
        }
        function ident() {
            return false;
        }
        function symbol() {
            var c = src.charAt(current);
            if (symbols.contains(c)){
                //
            }
            return false;
        }
        while (current < src.length){
            if(whitespace()){}
            else if(string()){}
            else if(symbol()){}
            else if(ident()){}
            start = current;
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
    }
}