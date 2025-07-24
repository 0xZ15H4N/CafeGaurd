import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

class AESUtil {

    // Derive AES key (256-bit) from string using SHA-256
    public static SecretKeySpec getKeyFromPassword(String password) throws Exception {
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = sha.digest(password.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(keyBytes, "AES");
    }

    // Encrypt plaintext
    public static String encrypt(String plainText, String password) throws Exception {
        SecretKeySpec key = getKeyFromPassword(password);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

        byte[] iv = new byte[16]; // 16-byte IV
        new SecureRandom().nextBytes(iv); // Generate random IV
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
        byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

        // Prepend IV to ciphertext and Base64 encode
        byte[] encryptedWithIv = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, encryptedWithIv, 0, iv.length);
        System.arraycopy(encrypted, 0, encryptedWithIv, iv.length, encrypted.length);

        return Base64.getEncoder().encodeToString(encryptedWithIv);
    }

    // Decrypt ciphertext
    public static String decrypt(String encryptedText, String password) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(encryptedText);

        byte[] iv = new byte[16];
        byte[] ciphertext = new byte[decoded.length - 16];

        System.arraycopy(decoded, 0, iv, 0, 16);
        System.arraycopy(decoded, 16, ciphertext, 0, ciphertext.length);

        SecretKeySpec key = getKeyFromPassword(password);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));

        byte[] decrypted = cipher.doFinal(ciphertext);
        return new String(decrypted, StandardCharsets.UTF_8);
    }
}
