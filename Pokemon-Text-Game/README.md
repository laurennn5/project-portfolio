# Interactive Text-Based Pokémon Game

## Project Overview

This project is an interactive text-based Pokémon adventure game developed in Java. The player chooses a starter Pokémon, navigates through a 4×4 map inspired by the Kanto region, encounters randomly selected wild Pokémon, and participates in turn-based battles.

The project demonstrates object-oriented programming through multiple Java classes that manage the game, Pokémon attributes, type relationships, movement, battles, and user interaction.

## Game Features

- Choose Charmander, Bulbasaur, or Squirtle as a starter Pokémon
- Enter and customize the trainer's name
- Navigate a 4×4 map using directional commands
- Visit named locations throughout the Kanto region
- Encounter wild Pokémon after a random number of moves
- View wild Pokémon information using a Pokédex
- Select attacks from the starter Pokémon's available moves
- Battle wild Pokémon through a turn-based combat system
- Track the remaining hearts of both Pokémon
- Apply type advantages by giving the stronger Pokémon additional hearts
- Continue exploring after winning a battle
- End the game by entering `exit` or when the starter Pokémon faints

The player can encounter one of five wild Pokémon:

- Arcanine — Fire
- Tangela — Grass
- Vaporeon — Water
- Machamp — Fighting
- Pikachu — Electric

Each wild Pokémon has its own description, type, set of moves, and health.

## Programming Concepts

This project demonstrates the use of:

- Java
- Object-oriented programming
- Classes and objects
- Enumerations
- Methods and constructors
- Getter methods
- Arrays and two-dimensional arrays
- Loops and conditional statements
- Switch statements
- Random number generation
- File and console input
- Input validation
- Exception handling

## Project Files

- `Pokemon.java` — controls the main game, map navigation, starter selection, wild encounters, and battle system
- `Wild.java` — stores wild Pokémon names, types, descriptions, moves, and hearts while managing damage and type advantages
- `Type.java` — defines the Fire, Grass, Water, Fighting, and Electric Pokémon types
- `welcome.txt` — contains the introductory text displayed when the game begins

## How to Run

Make sure Java is installed and all project files are saved in the same folder.

### Compile the Java files

```bash
javac Pokemon.java Wild.java Type.java
```

### Run the game

```bash
java Pokemon
```

The game reads its introduction from `welcome.txt` when the file is available. If the file is missing, the game displays a default welcome message and continues running.

## How to Play

1. Enter your trainer name.
2. Choose Charmander, Bulbasaur, or Squirtle as your starter Pokémon.
3. Move around the map by entering `up`, `down`, `left`, or `right`.
4. After a random number of valid moves, a wild Pokémon will appear.
5. Choose whether to view its Pokédex information.
6. Enter one of your starter Pokémon's listed moves.
7. Continue attacking until either Pokémon runs out of hearts.
8. Continue exploring after winning, or enter `exit` to end the game.

## Type Advantage System

Both Pokémon normally begin a battle with three hearts. A Pokémon with a type advantage receives two additional hearts.

The current relationships include:

- Fire is strong against Grass and weak against Water
- Grass is strong against Water and Fighting and weak against Fire
- Water is strong against Fire and weak against Grass and Electric
- Electric is strong against Water

## Future Improvements

Possible additions to the project include:

- Different damage amounts based on individual moves
- A larger map with additional locations
- Experience points and Pokémon leveling
- Catching wild Pokémon
- A full team system
- Healing locations (ex. Pokémon Centers)
- Items and an inventory
- More complete Pokémon type relationships
- Graphical or web-based gameplay
