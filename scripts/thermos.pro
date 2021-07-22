Act 0
Def array string first_names: ["Marla", "Winifred", "Albert", "Ester", "Fenric", "Vanessa", "Edith", "Rene", "Trilby", "Sanjay", "Mateo", "Madeline", "Stetson", "Thing", "Franz", "Wensleydale", "Petra", "Marty", "Emmett", "Biff", "Lyndon", "Dick", "Dolemite", "Martok", "Alowishus", "Grogu", "Rupret", "Apollonius", "Terspichore", "Demosthenes", "Anastasia", "Xerxes", "Phobos", "Ganymede", "Hyperion", "Umbriel", "Proteus", "Charon", "Dysnomia", "Steve", "Oedon", "Percy", "Hikaru", "Wally", "Shawn", "Hermes", "Toby", "Nashandra", ]

Def array string middle_names: ["Duke", "Pearl", "Seersucker", "Foxglove", "Hootenanny", "Devadander", "Snakes", , "Houndstooth", "Obediah", "Tyrion", "Wafflemacher", "Bader", "S", "Argyle", "'Two Sheds'", "Damask", "Matelassé", "Quatrefoil", "Suzani", "Chevron", "Paisley", "Ogee", "Herringbone", "Chinoiserie", "Lingthusiasm", "Titania", "Millicent", "Zilpah", "Ziggy", "Linus", "Trilobyte", "Arachnidae", "Atticus", "Xen", "Teriyaki", "Soba", "Radiatore", "Fusilli", "Fettuccine", "Linguine", "Gnocchi", "Manicotti", "Spaghetti", "Ravioli", "Tortellini"]

Def array string last_names: ["Griggs", "Head", "Marzipan", "Haberdasher", "O'Hara", "Stilton", "StarRider", "Mateo", "Etoufee", "Lamar", "Gloop", "Thing", "Newstead", "Hearst", "Nidhogg", "Goulash", "Jambalaya", "Power", "Scriabin", "Bartok", "Abercrombie", "von Ribbentrop", "Terkel", "Weinrib", "Charlemagne", "Lothric", "Threepwood", "Tannen", "Malloy", "Disraeli", "Vendrick", "Hyrule", "Stubbs", "Finklestein", "Seraphim", "Osborn", "Parker", "Richards", "Wayne", "Batman", "Goober", "Venture", "Picard", "Dax", "Bourbon", "Wong", "Raine", ]

Global string full_name

Narrator: “Prelude”

Scene Only

Clip first

Narrator: “On your walk home from Ethical Corp™ you are filled with a dawning horror as you realize... You left your thermos behind! And it's after hours!
Flustered you try to remember your first name:”

For name in first_names:
    Option name:
        Set full_name to full_name + “ “ + name
        Goto clip middle

Clip middle

Narrator: “Good job! After some more consideration you remember your middle name:”

For name in middle_names:
    Option name:
        Set full_name to full_name + “ “ + name
        Goto clip last

Clip last

Narrator: “Truly your powers of recollection are remarkable. Your last name then?”

For name in last_names:
    Option name:
        Set full_name to full_name + “ “ + name
        Goto clip summary

Clip summary
Narrator: "Of course! Your name is and has always been " + full_name
Option "Of course":
    Goto act 1

Act 1