
class Main {
    static public function main():Void {
        var script = "";
        #if sys
        script = sys.io.File.getContent("scripts/test.mir");
        var prog = Parser.parse(script);
        // for (token in prog) {
        //     trace(token);
        // }
        var printable = prog.map(token -> token.type + " " + token.literal + " " + token.line).join('\n');
        //sys.io.File.saveContent("ariel/test.air", printable);
        var temp = sys.io.File.getContent("ariel/temp.js");
        //sys.io.File.saveContent("html5/index.js", temp);
        //sys.io.File.append()
        var file = sys.io.File.write("html5/index.js");
        file.writeString(temp);
        file.writeString("\n\n");
        file.writeString("const program = " + printable);
        file.writeString("\n\n");
        file.writeString("interpret(program);");
        #end
    }
}