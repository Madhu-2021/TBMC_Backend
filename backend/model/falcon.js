const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the Python script
const pythonScriptPath = path.join(__dirname, 'run_query.py');

function generateResponse(userInput) {
  return new Promise((resolve, reject) => {
    // Escape quotes in the user input to prevent command injection
    const escapedInput = userInput.replace(/"/g, '\\"');
    
    // Execute the Python script with the user input
    console.log(`Processing request: ${escapedInput}`);
    exec(`python "${pythonScriptPath}" "${escapedInput}"`, 
      { maxBuffer: 1024 * 1024 * 10 }, // Increase buffer size for larger responses
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          reject('Error generating response from the model');
          return;
        }
        
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        
        // Clean the response - remove loading messages
        const outputLines = stdout.split('\n');
        // Skip loading message lines
        const responseLines = outputLines.filter(line => 
          !line.includes("Loading model") && 
          !line.includes("Processing")
        );
        
        // Return the cleaned response
        const response = responseLines.join('\n').trim();
        console.log(`Generated response: ${response}`);
        resolve(response);
      }
    );
  });
}

// Create the Python script with updated content
// const pythonScriptContent = `

// import sys
// import os
// import torch
// from transformers import AutoModelForCausalLM, AutoTokenizer
// from peft import PeftModel, PeftConfig

// # Suppress warnings
// import warnings
// warnings.filterwarnings("ignore")

// # Get input from command line
// if len(sys.argv) < 2:
//     print("Usage: python run_query.py 'user question'")
//     sys.exit(1)

// # Add food service context to the input
// original_input = sys.argv[1]
// user_input = f"As a food service assistant, please answer: {original_input}"

// try:
//     # Path to your checkpoint directory
//     checkpoint_path = r"C:\\Users\\venki\\Downloads\\falcon_lora_model\\content\\falcon_rw1b_foodassist_lora\\checkpoint_36"
    
//     print(f"Loading model from checkpoint: {checkpoint_path}")
    
//     # Create temp directory for offloading if needed
//     temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_offload")
//     os.makedirs(temp_dir, exist_ok=True)
    
//     # Load tokenizer directly from checkpoint
//     tokenizer = AutoTokenizer.from_pretrained(checkpoint_path)
    
//     # Load base model with memory optimizations
//     base_model = AutoModelForCausalLM.from_pretrained(
//         "tiiuae/falcon-rw-1b", 
//         torch_dtype=torch.float16,  # Use half precision
//         low_cpu_mem_usage=True,     # Optimize CPU memory usage
//         offload_folder=temp_dir     # Specify folder for offloading
//     )
    
//     # Load adapter config
//     config = PeftConfig.from_pretrained(checkpoint_path)
    
//     # Apply adapter to base model
//     model = PeftModel.from_pretrained(base_model, checkpoint_path)
    
//     # Set to evaluation mode for faster inference
//     model.eval()
    
//     # Generate response with optimized settings
//     inputs = tokenizer(user_input, return_tensors="pt")
    
//     # Create attention mask
//     attention_mask = torch.ones_like(inputs["input_ids"])
    
//     # Generate with optimized parameters
//     with torch.no_grad():
//         outputs = model.generate(
//             inputs["input_ids"],
//             attention_mask=attention_mask,
//             max_length=100,          # Reduced for faster generation
//             temperature=0.7,
//             do_sample=True,
//             pad_token_id=tokenizer.eos_token_id,
//             num_beams=1,             # Disable beam search for speed
//             early_stopping=True
//         )
    
//     response = tokenizer.decode(outputs[0], skip_special_tokens=True)
//     print(response)
    
// except Exception as e:
//     print(f"Error processing request: {str(e)}")
//     import traceback
//     traceback.print_exc()
//     sys.exit(1)
// `;

// // Write the Python script
// fs.writeFileSync(pythonScriptPath, pythonScriptContent);
// console.log(`Updated Python script at ${pythonScriptPath}`);

module.exports = { generateResponse };