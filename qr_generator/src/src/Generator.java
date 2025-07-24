// File: src/Generator.java
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import java.nio.file.FileSystems;
import java.nio.file.Path;



// compiled using 
// javac -cp "lib/*" -d out src/Generator.java

// run using
// java -cp "lib/*;out" Generator

public class Generator {

    public static void main(String[] args){




    }

    void make(String Encrypted) {
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
