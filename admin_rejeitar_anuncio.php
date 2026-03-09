<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id) && !empty($dados->motivo)) {
    $id = $conexao->real_escape_string($dados->id);
    $motivo = $conexao->real_escape_string($dados->motivo);
    $data_rejeicao = date('Y-m-d H:i:s'); // Guarda a data/hora exata da rejeição

    // Atualiza o estado e guarda o motivo
    $sql = "UPDATE anuncios SET 
                status_aprovacao = 'rejeitado', 
                motivo_rejeicao = '$motivo',
                data_rejeicao = '$data_rejeicao'
            WHERE id = '$id'";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Anúncio rejeitado com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao rejeitar o anúncio."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Dados incompletos. ID ou motivo em falta."));
}
?>