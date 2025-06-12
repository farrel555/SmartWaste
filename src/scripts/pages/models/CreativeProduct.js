class CreativeProduct {
    constructor({ id, name, description, imageUrl, category }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category; // 'organik' atau 'nonorganik'
    }
}

export default CreativeProduct;