import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;


class Encrytor {

    private static final String ALGO = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 16;
    private static final int IV_SIZE = 12;


    public static String AES_encrypt(String plainText , SecretKey key, byte[] iv) throws Exception{

        Cipher cipher = Cipher.getInstance(ALGO);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        byte[] encrypted = cipher.doFinal(plainText.getBytes());
        byte[] combined = new byte[IV_SIZE + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, IV_SIZE);
        System.arraycopy(encrypted, 0, combined, IV_SIZE, encrypted.length);
        return Base64.getEncoder().encodeToString(combined);
    }
    public static SecretKey generateKey() throws Exception {
        KeyGenerator gen = KeyGenerator.getInstance("AES");
        gen.init(256); // use 128 if 256 isn't supported
        return gen.generateKey();
    }

    public static String decrypt(String cipherText, SecretKey key) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(cipherText);
        byte[] iv = new byte[IV_SIZE];
        byte[] cipher = new byte[decoded.length - IV_SIZE];
        System.arraycopy(decoded, 0, iv, 0, IV_SIZE);
        System.arraycopy(decoded, IV_SIZE, cipher, 0, cipher.length);
        Cipher c = Cipher.getInstance(ALGO);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
        c.init(Cipher.DECRYPT_MODE, key, spec);
        byte[] plain = c.doFinal(cipher);
        return new String(plain);
    }

    public static String make(String args) throws Exception {
        SecretKey key = generateKey();
        byte[] iv = new byte[IV_SIZE]; // generate securely in production
        String enc = AES_encrypt(args, key, iv);
        return enc;
    }
    
}
