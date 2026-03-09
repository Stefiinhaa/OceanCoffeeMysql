<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    $sql = "SELECT nome, email, telefone FROM usuarios WHERE id = $id";
    $resultado = $conexao->query($sql);

    if ($resultado && $resultado->num_rows > 0) {
        $perfil = $resultado->fetch_assoc();
        echo json_encode(array("status" => true, "perfil" => $perfil));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Perfil não encontrado."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "ID inválido."));
}
?>