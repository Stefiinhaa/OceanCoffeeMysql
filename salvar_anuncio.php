<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    include_once 'conexao.php';

    $usuario_id = isset($_POST['usuario_id']) ? $_POST['usuario_id'] : '';
    $titulo = isset($_POST['titulo']) ? $_POST['titulo'] : '';
    $descricao = isset($_POST['descricao']) ? $_POST['descricao'] : '';
    $preco = isset($_POST['preco']) ? $_POST['preco'] : 0;
    $local = isset($_POST['local']) ? $_POST['local'] : '';
    $contato = isset($_POST['contato']) ? $_POST['contato'] : '';

    // Pasta onde as fotos serão salvas
    $diretorio_destino = "uploads/";
    
    // Matriz para guardar os caminhos das 3 imagens
    $caminhos_imagens = ['', '', ''];

    // Processa os 3 arquivos de imagem (se existirem)
    for ($i = 0; $i < 3; $i++) {
        $input_name = 'imagem_' . $i;
        if (isset($_FILES[$input_name]) && $_FILES[$input_name]['error'] === UPLOAD_ERR_OK) {
            // Cria um nome único para a imagem para não haver nomes repetidos
            $extensao = strtolower(pathinfo($_FILES[$input_name]['name'], PATHINFO_EXTENSION));
            $novo_nome = uniqid() . '_' . time() . '.' . $extensao;
            $caminho_completo = $diretorio_destino . $novo_nome;
            
            // Move a foto para a pasta "uploads"
            if (move_uploaded_file($_FILES[$input_name]['tmp_name'], $caminho_completo)) {
                $caminhos_imagens[$i] = $caminho_completo;
            }
        }
    }

    if (!empty($usuario_id) && !empty($titulo)) {
        $usuario_id = $conexao->real_escape_string($usuario_id);
        $titulo = $conexao->real_escape_string($titulo);
        $descricao = $conexao->real_escape_string($descricao);
        $preco = $conexao->real_escape_string($preco);
        $local = $conexao->real_escape_string($local);
        $contato = $conexao->real_escape_string($contato);
        
        // Pega apenas o caminho do arquivo (ex: uploads/foto1.jpg)
        $img0 = $conexao->real_escape_string($caminhos_imagens[0]);
        $img1 = $conexao->real_escape_string($caminhos_imagens[1]);
        $img2 = $conexao->real_escape_string($caminhos_imagens[2]);

        $sql = "INSERT INTO anuncios (usuario_id, titulo, descricao, preco, local, contato, imagem_0, imagem_1, imagem_2, status_aprovacao) 
                VALUES ('$usuario_id', '$titulo', '$descricao', '$preco', '$local', '$contato', '$img0', '$img1', '$img2', 'pendente')";
        
        if ($conexao->query($sql) === TRUE) {
            echo json_encode(array("status" => true, "mensagem" => "Anúncio criado com sucesso!"));
        } else {
            echo json_encode(array("status" => false, "mensagem" => "Erro na base de dados: " . $conexao->error));
        }
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Dados incompletos."));
    }

} catch (Exception $e) {
    echo json_encode(array("status" => false, "mensagem" => "Erro interno no servidor: " . $e->getMessage()));
}
?>