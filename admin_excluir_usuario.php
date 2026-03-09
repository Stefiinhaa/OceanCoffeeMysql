<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id)) {
    $id = $conexao->real_escape_string($dados->id);

    // Dica de segurança: ao apagar o utilizador, o ideal é apagar também os seus anúncios.
    $conexao->query("DELETE FROM anuncios WHERE usuario_id = '$id'");
    
    // Apaga o utilizador
    $sql = "DELETE FROM usuarios WHERE id = '$id'";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Usuário excluído com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao excluir."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "ID não fornecido."));
}
?>