//Lauren Yee
import java.util.*; //for scanner object
import java.io.*; //for file object
public class Pokemon {
	private static int map_size = 4;
	private static char[][] map = new char[map_size][map_size]; 
	private static String [][] location = new String[map_size][map_size]; //the map is going to be on a 4 X 4 two-dimensional array
	private static int trainerRow = 0; 
	private static int trainerCol = 0;
	private static int moveCount = 0;
	private static int moveBeforeBattle;
	private static Random random = new Random();
	private static boolean inBattle = false;
	private static int battle = 0;
	private static String partner = "";
	void main() throws FileNotFoundException{
		try {
			File f = new File("welcome.txt"); 
			Scanner input = new Scanner(f); //scanner input reads from the file f
			intro(input);
			System.out.println();
			Scanner scr = new Scanner(System.in); /*introduces the parameter scan, so that processName can be executed with typed inputs*/
			userName(scr);
			System.out.println();
			starter(scr);
			initializeMap(); 
			displayMap();
			moveBeforeBattle = random.nextInt(5);
			Scanner moveScan = new Scanner(System.in);
			while (inBattle == false) {
				System.out.println("Enter your move (up, down, left, right) or 'exit' to quit:");
				String move = moveScan.nextLine();
				if (move.equals("exit")) {
					System.out.println("Thanks for playing!");
					break;
				}
				moveTrainer(move);
				moveCount++;
				displayMap();
				if (moveCount == moveBeforeBattle) {
					battleMode();
					moveCount = 0;
					moveBeforeBattle = random.nextInt(5) + 1;
				}
			} 
		} catch (FileNotFoundException e) {
			System.out.println("File not found.");
		}
	}
	private static void intro(Scanner input) throws IllegalArgumentException { //method for description of Kanto
		if (input == null) {
			throw new IllegalArgumentException("the scanner did not read anything");
		}
		while(input.hasNextLine()) { //while the scanner detects a line of input
			String line = input.nextLine(); //stores the next line into string line
			System.out.println(line);
		}
	}
	private static void userName(Scanner scr) throws IllegalArgumentException {
		if (scr == null) {
			throw new IllegalArgumentException("the scanner did not read anything");
		}
		System.out.println();
		System.out.println("Hello Trainer, what is your name?");
		String name = scr.next();
		name = name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase(); //accounts for inconsistent capitalization
		System.out.println("Hello " + name + "! *Here is your Pokedex!*");
	}
	public static void starter(Scanner scan) throws IllegalArgumentException {
		System.out.println("Your objective today is to find pokemon to battle across Kanto. But first, you need to choose a starter pokemon.");
		System.out.println("Please choose one of the Kanto starter pokemon: Charmander, Bulbasaur, or Squirtle.");
		boolean validChoice = false;
		do {
			partner = scan.next();
			partner = partner.substring(0, 1).toUpperCase() + partner.substring(1).toLowerCase(); //accounts for inconsistent capitalization
			if (partner.equals("Charmander") || partner.equals("Bulbasaur") || partner.equals("Squirtle")) { //if/else statement for incorrect input for starter pokemon
				validChoice = true;
			} else {
				System.out.println("Oops, that is not one of the starter pokemon. Please try again!");
			}
		} while(!validChoice);
		System.out.println("...You have selected " + partner + " as your partner. Great choice!");
		System.out.println();
	}
	
	private static void initializeMap() throws IllegalArgumentException {
		for (int i = 0; i < map_size; i++) {
			for (int j = 0; j < map_size; j++) {
				map[i][j] = '.'; //initializes each cell with a dot
				location[i][j] = null; //initializes each location as null
			}
		}
		location[0][0] = "Pewter City";
		location[1][0] = "Viridian Forest";
		location[2][0] = "Viridian City";
		location[3][0] = "Pallet Town";
		location[1][1] = "Celadon City";
		location[0][2] = "Cerulean City";
		location[1][2] = "Saffron City";
		location[2][2] = "Vermilion City";
		map[trainerRow][trainerCol] = 'X'; //represents the trainer's location
	}
	
	private static void displayMap() throws IllegalArgumentException {
		if (location[trainerRow][trainerCol] != null) {
				System.out.println(location[trainerRow][trainerCol]);
			}
		for(int i = 0; i < map_size; i++) {
			for (int j = 0; j < map_size; j++) {
				System.out.print(map[i][j] + " ");
			}
			System.out.println();
		}
	}
	
	private static void moveTrainer(String move) {
		map[trainerRow][trainerCol] = '.';  
		switch (move) {
			case "up":
				if (trainerRow > 0) {
					trainerRow--;
				}
				break;
			case "down":
				if (trainerRow < map_size - 1) {
					trainerRow++;
				}
				break;
			case "left":
				if (trainerCol > 0) {
					trainerCol--;
				}
				break;
			case "right":
				if (trainerCol < map_size - 1) {
					trainerCol++;
				}
				break;
			default:
				System.out.println("Invalid, please try again.");
		}
		map[trainerRow][trainerCol] = 'X'; 
	}
	private static void battleMode() {
		inBattle = true;
		//first, pick wild pokemon
		String found = "";
		Wild w = null;
		int[] wild = {0, 1, 2, 3, 4};
		String[] movesf = {"Crunch", "Flame Wheel", "Play Rough", "Flamethrower"};
		String[] movesg = {"Stun Spore", "Vine Whip", "Giga Drain", "Sleep Powder"};
		String[] movesw = {"Swift", "Water Pulse", "Aqua Ring", "Helping Hand"};
		String[] movesfight = {"Low Kick", "Seismic Toss", "Cross Chop", "Revenge"};
		String[] movese = {"Quick Attack", "Thunderbolt", "Iron Tail", "Electroweb"};
		Wild[] critters = new Wild[5];
		critters[0] = new Wild(Type.Fire, "Arcanine, the Legendary Pokemon. Its magnificent bark conveys a sense of majesty. Anyone hearing it cannot help but grovel before it.",
		movesf, 3);
		critters[1] = new Wild(Type.Grass, "Tangela, the Vine Pokemon. It tangles any moving thing with its vines. Their subtle shaking is ticklish if you get ensnared.",
		movesg, 3);
		critters[2] = new Wild(Type.Water, "Vaporeon, the Bubble Jet Pokemon. It prefers beautiful shores. With cells similar to water molecules, it could melt in water.",
		movesw, 3);
		critters[3] = new Wild(Type.Fighting, "Machamp, the Superpower Pokemon. It uses its four powerful arms to pin the limbs of its foe, then throws the victim over the horizon.",
		movesfight, 3);
		critters[4] = new Wild(Type.Electric, "Pikachu, the Mouse Pokemon. It raises its tail to check its surroundings. The tail is sometimes struck by lightning in this pose.",
		movese, 3); 
		Random r = new Random ();
		int choose = r.nextInt(5);
		if (choose == 0) { //Arcanine
			found = "Arcanine";
		} else if (choose == 1) { //Tangela
			found = "Tangela";
		} else if (choose == 2) { //Vaporeon
			found = "Vaporeon";
		} else if (choose == 3) { //Machamp
			found = "Machamp";
		} else { //Pikachu
			found = "Pikachu";
		}
		System.out.println();
		System.out.println("A wild " + found + " has appeared!");
		System.out.println();
		System.out.println(partner + ", I choose you!");
		System.out.print("(Remember that your partner's moves are: ");
		if (partner.equals("Charmander")) {
			System.out.print("Flamethrower, Flame Charge, Fire Spin, and Slash)");
		} else if (partner.equals("Bulbasaur")) {
			System.out.print("Vine Whip, Seed Bomb, Solar Beam, and Razor Leaf)");
		} else if (partner.equals("Squirtle")) {
			System.out.print("Hydropump, Aqua Tail, Shell Smash, and Bite)");
		}
		System.out.println();
		System.out.println("Should I use my pokedex? (Please choose Yes or No)");
		String look = "";
		Scanner wildMoves = new Scanner(System.in);
		look = wildMoves.next();
		look = look.toUpperCase();
		boolean validChoice2 = false;
		do {
			if (look.equals("YES")) { //if/else statement for incorrect input for starter pokemon
				if (choose == 0) {
				System.out.print(critters[0]);
				validChoice2 = true;
				} else if (choose == 1) {
				System.out.print(critters[1]);
				validChoice2 = true;
				} else if (choose == 2) {
				System.out.print(critters[2]);
				validChoice2 = true;
				} else if (choose == 3) {
				System.out.print(critters[3]);
				validChoice2 = true;
				} else {
				System.out.print(critters[4]);
				System.out.println();
				System.out.println("I see...let's get to battling!");
				validChoice2 = true;
				}
			} else if (look.equals("NO")) {
				System.out.println();
				System.out.println("Alright, let's get to battling!");
				validChoice2 = true;
			} else {
				System.out.println("Please choose Yes or No");
			}
		} while(!validChoice2);
		System.out.println();
		//fight loop
		System.out.println("(Select one of your pokemon's moves!)");
		String attack = "";
		Scanner m = new Scanner(System.in);
		boolean validChoice3 = false;
		do {
			attack = m.nextLine().toUpperCase();
			if (partner.equals("Charmander")) {
				if (attack.equals("FLAMETHROWER") || attack.equals("FLAME CHARGE") || attack.equals("FIRE SPIN") || attack.equals("SLASH")) { //if/else statement for incorrect input for starter pokemon
					//w.damage();
					validChoice3 = true;
				}
			} else if (partner.equals("Bulbasaur")) {
				if (attack.equals("VINE WHIP") || attack.equals("SEED BOMB") || attack.equals("SOLAR BEAM") || attack.equals("RAZOR LEAF")) {
					//w.damage();
					validChoice3 = true;
				}
			} else if (partner.equals("Squirtle")) {
				if (attack.equals("HYDROPUMP") || attack.equals("AQUA TAIL") || attack.equals("SHELL SMASH") || attack.equals("BITE")) {
					w.damage();
					validChoice3 = true;
				}
			} else if (partner.equals("Charmander") || partner.equals("Bulbasaur") || partner.equals("Squirtle")){
					if (!attack.equals("FLAMETHROWER") && !attack.equals("FLAME CHARGE") && !attack.equals("FIRE SPIN") && !attack.equals("SLASH") && 
					!attack.equals("VINE WHIP") && !attack.equals("SEED BOMB") && !attack.equals("SOLAR BEAM") && !attack.equals("RAZOR LEAF") && 
					!attack.equals("HYDROPUMP") && !attack.equals("AQUA TAIL") && !attack.equals("SHELL SMASH") && !attack.equals("BITE")) {
						System.out.println("Oops, that is not one of your pokemon's moves. Please try again!");
					}
			}
			
		} while(!validChoice3);
		System.out.println();
		System.out.println(partner + ", use " + attack + "!");
		
		
        //call damage when partner gets damaged
    } 
}
