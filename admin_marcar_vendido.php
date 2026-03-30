<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$data = json_decode(file_get_contents("php://input"));

// Aceita dados tanto via JSON (fetch) quanto formulário
$id = isset($data->id) ? $data->id : (isset($_POST['id']) ? $_POST['id'] : null);
$vendido = isset($data->vendido) ? $data->vendido : (isset($_POST['vendido']) ? $_POST['vendido'] : 1);

if ($id) {
    $stmt = $conexao->prepare("UPDATE anuncios SET vendido = ? WHERE id = ?");
    $stmt->bind_param("ii", $vendido, $id);
    
    if ($stmt->execute()) {
        echo json_encode(array("status" => true, "mensagem" => "Status de venda atualizado com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao atualizar o banco de dados."));
    }
    $stmt->close();
} else {
    echo json_encode(array("status" => false, "mensagem" => "ID do anúncio não fornecido."));
}
?>