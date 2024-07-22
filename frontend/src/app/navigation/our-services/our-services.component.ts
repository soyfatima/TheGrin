import { Component } from '@angular/core';

@Component({
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrl: './our-services.component.css'
})
export class OurServicesComponent {
  services = [
    {icon:'fa-heartbeat', name: 'service-1', bgcolor:'service-1', description: 'content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem' },
    {icon:'fa-female', name: 'service-2', bgcolor:'service-2', description: 'content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem' },
    {icon:'fa-', name: 'service-3', bgcolor:'service-3', description: 'content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem' },
    {icon:'fa-', name: 'service-4', bgcolor:'service-4', description: 'content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem' },
    {icon:'fa-', name: 'service-5', bgcolor:'service-5', description: 'content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem' },
    {icon:'fa-', name: 'service-6', bgcolor:'service-6', description: 'content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem' },

  ]
}
