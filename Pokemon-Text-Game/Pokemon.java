//Lauren Yee
import java.util.*; //for scanner object
import java.io.*; //for file object

public class Pokemon {
	private static int map_size = 4;
	private static char[][] map = new char[map_size][map_size];
	private static String[][] location = new String[map_size][map_size];
	//the map is going to be on a 4 X 4 two-dimensional array
	
	private static int trainerRow = 0;
	private static int trainerCol = 0;
	private static int moveCount = 0;
	private static int moveBeforeBattle;
	private static Random random = new Random();
	private static boolean inBattle = false;
	private static Wild partner;
	
	
	public static void main(String[] args) {
		Scanner scr = new Scanner(System.in);
		
		try {
			File f = new File("welcome.txt");
			Scanner input = new Scanner(f); //scanner input reads from the file f
			
			intro(input);
			input.close();
		} catch (FileNotFoundException e) {
			/*
			 * The game will still run even if the welcome file
			 * cannot be found.
			 */
			System.out.println("Welcome to the Kanto Pokemon Adventure!");
		}
		
		System.out.println();
		
		userName(scr);
		
		System.out.println();
		
		partner = starter(scr);
		
		initializeMap();
		displayMap();
		
		/*
		 * Randomly selects how many valid moves the trainer
		 * makes before the next battle.
		 */
		moveBeforeBattle = random.nextInt(5) + 1;
		
		boolean playing = true;
		
		while (playing) {
			System.out.println();
			System.out.println(
					"Enter your move (up, down, left, right) or 'exit' to quit:");
			
			String move = scr.nextLine().trim().toLowerCase();
			
			if (move.equals("exit")) {
				System.out.println("Thanks for playing!");
				playing = false;
				continue;
			}
			
			boolean validMove = moveTrainer(move);
			
			/*
			 * Invalid moves do not increase the move count.
			 */
			if (!validMove) {
				continue;
			}
			
			moveCount++;
			displayMap();
			
			if (moveCount >= moveBeforeBattle) {
				inBattle = true;
				battleMode(scr);
				inBattle = false;
				
				moveCount = 0;
				moveBeforeBattle = random.nextInt(5) + 1;
				
				/*
				 * If the player's Pokemon faints, the game ends.
				 */
				if (partner.hasFainted()) {
					System.out.println();
					System.out.println(
							partner.getName() +
							" needs to rest, so your adventure is over.");
					
					playing = false;
				}
			}
		}
		
		scr.close();
	}
	
	
	private static void intro(Scanner input) throws IllegalArgumentException {
		//method for description of Kanto
		
		if (input == null) {
			throw new IllegalArgumentException(
					"the scanner did not read anything");
		}
		
		while (input.hasNextLine()) {
			//while the scanner detects a line of input
			
			String line = input.nextLine();
			//stores the next line into string line
			
			System.out.println(line);
		}
	}
	
	
	private static void userName(Scanner scr)
			throws IllegalArgumentException {
		
		if (scr == null) {
			throw new IllegalArgumentException(
					"the scanner did not read anything");
		}
		
		System.out.println();
		System.out.println("Hello Trainer, what is your name?");
		
		String name = scr.nextLine().trim();
		
		while (name.isEmpty()) {
			System.out.println("Please enter your name:");
			name = scr.nextLine().trim();
		}
		
		name = name.substring(0, 1).toUpperCase() +
				name.substring(1).toLowerCase();
		//accounts for inconsistent capitalization
		
		System.out.println(
				"Hello " + name + "! *Here is your Pokedex!*");
	}
	
	
	public static Wild starter(Scanner scan)
			throws IllegalArgumentException {
		
		if (scan == null) {
			throw new IllegalArgumentException(
					"the scanner did not read anything");
		}
		
		System.out.println(
				"Your objective today is to find pokemon to battle across Kanto. "
				+ "But first, you need to choose a starter pokemon.");
		
		System.out.println(
				"Please choose one of the Kanto starter pokemon: "
				+ "Charmander, Bulbasaur, or Squirtle.");
		
		while (true) {
			String selectedPartner = scan.nextLine().trim();
			
			if (selectedPartner.isEmpty()) {
				System.out.println(
						"Please choose Charmander, Bulbasaur, or Squirtle.");
				continue;
			}
			
			selectedPartner =
					selectedPartner.substring(0, 1).toUpperCase() +
					selectedPartner.substring(1).toLowerCase();
			//accounts for inconsistent capitalization
			
			if (selectedPartner.equals("Charmander")) {
				String[] moves = {
						"Flamethrower",
						"Flame Charge",
						"Fire Spin",
						"Slash"
				};
				
				System.out.println(
						"...You have selected Charmander as your partner. "
						+ "Great choice!");
				
				System.out.println();
				
				return new Wild(
						"Charmander",
						Type.Fire,
						"Charmander, the Lizard Pokemon.",
						moves,
						3);
				
			} else if (selectedPartner.equals("Bulbasaur")) {
				String[] moves = {
						"Vine Whip",
						"Seed Bomb",
						"Solar Beam",
						"Razor Leaf"
				};
				
				System.out.println(
						"...You have selected Bulbasaur as your partner. "
						+ "Great choice!");
				
				System.out.println();
				
				return new Wild(
						"Bulbasaur",
						Type.Grass,
						"Bulbasaur, the Seed Pokemon.",
						moves,
						3);
				
			} else if (selectedPartner.equals("Squirtle")) {
				String[] moves = {
						"Hydro Pump",
						"Aqua Tail",
						"Shell Smash",
						"Bite"
				};
				
				System.out.println(
						"...You have selected Squirtle as your partner. "
						+ "Great choice!");
				
				System.out.println();
				
				return new Wild(
						"Squirtle",
						Type.Water,
						"Squirtle, the Tiny Turtle Pokemon.",
						moves,
						3);
				
			} else {
				//if/else statement for incorrect input for starter pokemon
				
				System.out.println(
						"Oops, that is not one of the starter pokemon. "
						+ "Please try again!");
			}
		}
	}
	
	
	private static void initializeMap() {
		for (int i = 0; i < map_size; i++) {
			for (int j = 0; j < map_size; j++) {
				map[i][j] = '.';
				//initializes each cell with a dot
				
				location[i][j] = null;
				//initializes each location as null
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
		
		map[trainerRow][trainerCol] = 'X';
		//represents the trainer's location
	}
	
	
	private static void displayMap() {
		System.out.println();
		
		if (location[trainerRow][trainerCol] != null) {
			System.out.println(location[trainerRow][trainerCol]);
		}
		
		for (int i = 0; i < map_size; i++) {
			for (int j = 0; j < map_size; j++) {
				System.out.print(map[i][j] + " ");
			}
			
			System.out.println();
		}
	}
	
	
	private static boolean moveTrainer(String move) {
		int newRow = trainerRow;
		int newCol = trainerCol;
		
		switch (move) {
			case "up":
				newRow--;
				break;
				
			case "down":
				newRow++;
				break;
				
			case "left":
				newCol--;
				break;
				
			case "right":
				newCol++;
				break;
				
			default:
				System.out.println("Invalid, please try again.");
				return false;
		}
		
		/*
		 * Prevents the trainer from moving outside of the map.
		 */
		if (newRow < 0 || newRow >= map_size ||
				newCol < 0 || newCol >= map_size) {
			
			System.out.println(
					"You cannot move beyond the edge of the map.");
			
			return false;
		}
		
		map[trainerRow][trainerCol] = '.';
		
		trainerRow = newRow;
		trainerCol = newCol;
		
		map[trainerRow][trainerCol] = 'X';
		
		return true;
	}
	
	
	private static void battleMode(Scanner scr) {
		//first, pick wild pokemon
		
		String[] movesf = {
				"Crunch",
				"Flame Wheel",
				"Play Rough",
				"Flamethrower"
		};
		
		String[] movesg = {
				"Stun Spore",
				"Vine Whip",
				"Giga Drain",
				"Sleep Powder"
		};
		
		String[] movesw = {
				"Swift",
				"Water Pulse",
				"Aqua Ring",
				"Helping Hand"
		};
		
		String[] movesfight = {
				"Low Kick",
				"Seismic Toss",
				"Cross Chop",
				"Revenge"
		};
		
		String[] movese = {
				"Quick Attack",
				"Thunderbolt",
				"Iron Tail",
				"Electroweb"
		};
		
		Wild[] critters = new Wild[5];
		
		critters[0] = new Wild(
				"Arcanine",
				Type.Fire,
				"Arcanine, the Legendary Pokemon. Its magnificent bark "
				+ "conveys a sense of majesty. Anyone hearing it cannot "
				+ "help but grovel before it.",
				movesf,
				3);
		
		critters[1] = new Wild(
				"Tangela",
				Type.Grass,
				"Tangela, the Vine Pokemon. It tangles any moving thing "
				+ "with its vines. Their subtle shaking is ticklish if "
				+ "you get ensnared.",
				movesg,
				3);
		
		critters[2] = new Wild(
				"Vaporeon",
				Type.Water,
				"Vaporeon, the Bubble Jet Pokemon. It prefers beautiful "
				+ "shores. With cells similar to water molecules, it "
				+ "could melt in water.",
				movesw,
				3);
		
		critters[3] = new Wild(
				"Machamp",
				Type.Fighting,
				"Machamp, the Superpower Pokemon. It uses its four "
				+ "powerful arms to pin the limbs of its foe, then "
				+ "throws the victim over the horizon.",
				movesfight,
				3);
		
		critters[4] = new Wild(
				"Pikachu",
				Type.Electric,
				"Pikachu, the Mouse Pokemon. It raises its tail to check "
				+ "its surroundings. The tail is sometimes struck by "
				+ "lightning in this pose.",
				movese,
				3);
		
		int choose = random.nextInt(critters.length);
		
		/*
		 * Stores the randomly selected wild Pokemon instead
		 * of leaving w equal to null.
		 */
		Wild w = critters[choose];
		
		/*
		 * Sets each Pokemon's hearts based on its type matchup.
		 */
		partner.setHearts(w);
		
		System.out.println();
		System.out.println(
				"A wild " + w.getName() + " has appeared!");
		
		System.out.println();
		System.out.println(
				partner.getName() + ", I choose you!");
		
		System.out.print(
				"(Remember that your partner's moves are: ");
		
		System.out.print(
				String.join(", ", partner.getMoves()) + ")");
		
		System.out.println();
		
		usePokedex(scr, w);
		
		System.out.println();
		
		/*
		 * Fight loop continues until either the player's Pokemon
		 * or the wild Pokemon has no hearts remaining.
		 */
		while (!partner.hasFainted() && !w.hasFainted()) {
			System.out.println();
			
			System.out.println(
					partner.getName() + " has " +
					partner.getHearts() + " hearts remaining.");
			
			System.out.println(
					w.getName() + " has " +
					w.getHearts() + " hearts remaining.");
			
			System.out.println();
			System.out.println(
					"(Select one of your pokemon's moves!)");
			
			String attack = scr.nextLine().trim();
			
			/*
			 * Keeps asking until the player enters one of
			 * the selected starter Pokemon's moves.
			 */
			while (!partner.hasMove(attack)) {
				System.out.println(
						"Oops, that is not one of your pokemon's moves. "
						+ "Please try again!");
				
				System.out.println(
						"Your available moves are: " +
						String.join(", ", partner.getMoves()));
				
				attack = scr.nextLine().trim();
			}
			
			System.out.println();
			System.out.println(
					partner.getName() + ", use " + attack + "!");
			
			//call damage when wild Pokemon gets damaged
			w.damage();
			
			System.out.println(
					w.getName() + " now has " +
					w.getHearts() + " hearts remaining.");
			
			/*
			 * The wild Pokemon does not attack after it has fainted.
			 */
			if (w.hasFainted()) {
				System.out.println();
				System.out.println(
						w.getName() + " fainted!");
				
				System.out.println(
						"You won the battle!");
				
				break;
			}
			
			/*
			 * The wild Pokemon randomly selects one of its moves
			 * and attacks the player's Pokemon.
			 */
			String wildAttack = w.getRandomMove();
			
			System.out.println();
			System.out.println(
					w.getName() + " used " + wildAttack + "!");
			
			//call damage when partner gets damaged
			partner.damage();
			
			System.out.println(
					partner.getName() + " now has " +
					partner.getHearts() + " hearts remaining.");
			
			if (partner.hasFainted()) {
				System.out.println();
				System.out.println(
						partner.getName() + " fainted!");
				
				System.out.println(
						"You lost the battle.");
			}
		}
		
		System.out.println();
		System.out.println("The battle has ended.");
	}
	
	
	private static void usePokedex(Scanner scr, Wild w) {
		System.out.println(
				"Should I use my pokedex? (Please choose Yes or No)");
		
		boolean validChoice = false;
		
		do {
			String look = scr.nextLine().trim().toUpperCase();
			
			if (look.equals("YES")) {
				System.out.println();
				System.out.println(w);
				System.out.println();
				System.out.println(
						"I see...let's get to battling!");
				
				validChoice = true;
				
			} else if (look.equals("NO")) {
				System.out.println();
				System.out.println(
						"Alright, let's get to battling!");
				
				validChoice = true;
				
			} else {
				System.out.println(
						"Please choose Yes or No");
			}
		} while (!validChoice);
	}
}
