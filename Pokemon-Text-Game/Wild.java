public class Wild {
    private String name;
    private int hearts;
    private String description;
    private Type type;
    private String[] moves;

    public Wild(
            String name,
            Type type,
            String description,
            String[] moves,
            int hearts) {

        this.name = name;
        this.type = type;
        this.description = description;
        this.moves = moves;
        this.hearts = hearts;
    }

    @Override
    public String toString() {
        return "Name: " + name
                + " // Type: " + type
                + " // Description: " + description
                + " // Moves: " + String.join(", ", moves)
                + " // Hearts: " + hearts;
    }

    /*
     * Both Pokémon normally begin with 3 hearts.
     * The Pokémon with the type advantage receives 5 hearts.
     */
    public void setHearts(Wild other) {
        this.hearts = 3;
        other.hearts = 3;

        switch (this.type) {
            case Fire:
                if (other.type == Type.Grass) {
                    this.hearts = 5;
                } else if (other.type == Type.Water) {
                    other.hearts = 5;
                }
                break;

            case Grass:
                if (other.type == Type.Water
                        || other.type == Type.Fighting) {
                    this.hearts = 5;
                } else if (other.type == Type.Fire) {
                    other.hearts = 5;
                }
                break;

            case Water:
                if (other.type == Type.Fire) {
                    this.hearts = 5;
                } else if (other.type == Type.Grass
                        || other.type == Type.Electric) {
                    other.hearts = 5;
                }
                break;

            case Fighting:
                /*
                 * No special Fighting relationships are currently defined.
                 */
                break;

            case Electric:
                if (other.type == Type.Water) {
                    this.hearts = 5;
                }
                break;

            default:
                break;
        }
    }

    public void damage() {
        if (hearts > 0) {
            hearts--;
        }
    }

    public boolean hasFainted() {
        return hearts <= 0;
    }

    public String getName() {
        return name;
    }

    public int getHearts() {
        return hearts;
    }

    public Type getType() {
        return type;
    }

    public String[] getMoves() {
        return moves;
    }

    public String getRandomMove() {
        int randomIndex = (int) (Math.random() * moves.length);
        return moves[randomIndex];
    }

    public boolean hasMove(String selectedMove) {
        for (String move : moves) {
            if (move.equalsIgnoreCase(selectedMove)) {
                return true;
            }
        }

        return false;
    }
}
