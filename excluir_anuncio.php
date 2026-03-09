<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id)) {
    $id = $conexao->real_escape_string($dados->id);

    $sql = "DELETE FROM anuncios WHERE id = '$id'";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Anúncio excluído com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao excluir o anúncio."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "ID do anúncio não fornecido."));
}
?>