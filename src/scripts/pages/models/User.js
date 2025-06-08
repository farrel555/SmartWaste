/**
 * Model User
 * Merepresentasikan data pengguna yang sedang login.
 * Dibuat dari objek user yang diberikan oleh Netlify Identity.
 */
class User {
    constructor(netlifyUser) {
        // 'sub' adalah ID unik dari Netlify Identity
        this.id = netlifyUser.sub; 
        
        this.email = netlifyUser.email;
        
        // Mengambil nama lengkap dari metadata, atau gunakan nama default
        this.fullName = netlifyUser.user_metadata?.full_name || 'Pengguna Baru';
    }
}

export default User;