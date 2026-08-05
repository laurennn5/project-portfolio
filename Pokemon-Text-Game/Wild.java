public class Wild {
	private int hearts;
	private String description;
	private Type type;
	private String [] moves;
	
	
	public Wild(Type type, String description, String [] moves, int hearts) {
		this.type = type;
		this.description = description;
		this.moves = moves;
		this.hearts = hearts;
	}
	public String toString() {
		return "Type: " + this.type + " // Description: " + this.description + 
				" // Moves: " + String.join(", ", this.moves) + " // Hearts: " + this.hearts;
	}
	
	public void setHearts (Wild other) {
		switch (this.type) {
			case Type.Fire: if(other.type == Type.Water) { //fire is weak against water, strong against grass
							other.hearts +=2;
							this.hearts = 3;
							break;
						} else if (other.type == Type.Grass) {
							this.hearts +=2;
							other.hearts = 3;
							break;
						}
			case Type.Grass: if (other.type == Type.Fire) { //grass is weak against fire, strong against fighting and water
							other.hearts += 2;
							this.hearts = 3;
							break;
						} else if (other.type == Type.Fighting || other.type == Type.Water) {
							this.hearts +=2;
							other.hearts = 3;
							break;
						}
						break;
			case Type.Water: if (other.type == Type.Grass || other.type == Type.Electric) {//water is weak against grass and electric, strong against fire 
							other.hearts +=2;
							this.hearts = 3;
							break;
						} else if (other.type == Type.Fire) {
							this.hearts += 2;
							other.hearts = 3;
							break;
						}
			default:
				this.hearts = 3;
				other.hearts = 3;
				break;
		}
		
	}
	public void damage () {
		if (this.hearts > 0) {
			this.hearts -= 1;
		}
	}
}
