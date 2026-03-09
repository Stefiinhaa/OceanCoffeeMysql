<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->email)) {
    $email = $conexao->real_escape_string($dados->email);
    $sql = "SELECT id FROM usuarios WHERE email = '$email'";
    $resultado = $conexao->query($sql);

    if ($resultado && $resultado->num_rows > 0) {
        echo json_encode(array("status" => true, "mensagem" => "Conta encontrada."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Esta conta nao esta cadastrada."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Por favor, insira o contacto."));
}
?>