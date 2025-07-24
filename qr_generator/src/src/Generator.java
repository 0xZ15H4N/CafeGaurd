// File: src/Generator.java
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.Scanner;
import java.time.LocalTime;




// compiled using 
// javac -cp "../lib/*" -d out AESUtil.java Generator.java


// run using 
// java -cp "lib/*;out" Generator

public class Generator {

    public static void main(String[] args){
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        LocalTime time = LocalTime.now();
        String formatted = String.format("(%02d-%02d-%02d)",time.getHour()+1, time.getMinute(), time.getSecond());
        String Data = formatted + "-"+  name;
        scanner.close();
        try {
            String password = "mySecretPassword123";
            String original = Data;
            String encrypted = AESUtil.encrypt(original, password);
            make(encrypted);

        } catch (Exception e) {
            System.err.println(e);
        }


    }

    public static void make(String Encrypted) {
        String data = Encrypted;
        String path = "../../assets/qr.png";

        try {
            BitMatrix matrix = new MultiFormatWriter().encode(
                    data,
                    BarcodeFormat.QR_CODE,
                    300, 300
            );

            Path file = FileSystems.getDefault().getPath(path);
            MatrixToImageWriter.writeToPath(matrix, "PNG", file);

            System.out.println("QR Code generated at: " + path);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
