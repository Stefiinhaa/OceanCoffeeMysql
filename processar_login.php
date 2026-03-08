<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if(!empty($dados->email) && !empty($dados->senha)) {
    $email = $conexao->real_escape_string($dados->email);
    $senha = $conexao->real_escape_string($dados->senha);

    $sql = "SELECT id, nome, email FROM usuarios WHERE email = '$email' AND senha = '$senha'";
    $resultado = $conexao->query($sql);

    if($resultado->num_rows > 0) {
        $utilizador = $resultado->fetch_assoc();
        echo json_encode(array(
            "mensagem" => "Login aprovado", 
            "status" => true,
            "usuario" => array(
                "id" => $utilizador['id'],
                "nome" => $utilizador['nome'],
                "email" => $utilizador['email']
            )
        ));
    } else {
        echo json_encode(array("mensagem" => "Credenciais incorretas", "status" => false));
    }
} else {
    echo json_encode(array("mensagem" => "Dados incompletos", "status" => false));
}
?>