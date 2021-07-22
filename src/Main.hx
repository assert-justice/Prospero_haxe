
class Main {
    static public function main():Void {
        var script = "";
        #if sys
        script = sys.io.File.getContent("scripts/test.pro");
        #end
    }
}