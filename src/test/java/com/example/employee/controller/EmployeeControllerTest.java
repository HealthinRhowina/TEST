package com.example.employee.controller;

import com.example.employee.model.Employee;
import com.example.employee.service.EmployeeService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmployeeService employeeService;


    @Test
    void shouldCreateEmployee() throws Exception {

        Employee employee = new Employee(
                null,
                "Rhowina",
                "Test",
                "rhowina@example.com",
                "9876543210",
                "Development"
        );

        Employee savedEmployee = new Employee(
                1L,
                "Rhowina",
                "Test",
                "rhowina@example.com",
                "9876543210",
                "Development"
        );

        when(employeeService.saveEmployee(any(Employee.class)))
                .thenReturn(savedEmployee);

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employee)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName").value("Rhowina"))
                .andExpect(jsonPath("$.lastName").value("Test"))
                .andExpect(jsonPath("$.email")
                        .value("rhowina@example.com"));

        verify(employeeService).saveEmployee(any(Employee.class));
    }


    @Test
    void shouldGetAllEmployees() throws Exception {

        Employee employee = new Employee(
                1L,
                "Rhowina",
                "Test",
                "rhowina@example.com",
                "9876543210",
                "Development"
        );

        when(employeeService.getAllEmployees())
                .thenReturn(List.of(employee));

        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].firstName")
                        .value("Rhowina"))
                .andExpect(jsonPath("$[0].department")
                        .value("Development"));

        verify(employeeService).getAllEmployees();
    }


    @Test
    void shouldGetEmployeeById() throws Exception {

        Employee employee = new Employee(
                1L,
                "Rhowina",
                "Test",
                "rhowina@example.com",
                "9876543210",
                "Development"
        );

        when(employeeService.getEmployeeById(1L))
                .thenReturn(Optional.of(employee));

        mockMvc.perform(get("/api/employees/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName")
                        .value("Rhowina"));

        verify(employeeService).getEmployeeById(1L);
    }


    @Test
    void shouldUpdateEmployee() throws Exception {

        Employee employee = new Employee(
                1L,
                "Updated",
                "Employee",
                "updated@example.com",
                "9876543210",
                "Testing"
        );

        when(employeeService.updateEmployee(
                eq(1L),
                any(Employee.class)))
                .thenReturn(employee);

        mockMvc.perform(put("/api/employees/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employee)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName")
                        .value("Updated"))
                .andExpect(jsonPath("$.department")
                        .value("Testing"));

        verify(employeeService)
                .updateEmployee(eq(1L), any(Employee.class));
    }

    @Test
    void shouldReturn404WhenEmployeeDoesNotExist() throws Exception {

        when(employeeService.getEmployeeById(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/employees/999"))
                .andExpect(status().isNotFound());

        verify(employeeService)
                .getEmployeeById(999L);
    }
    @Test
    void shouldReturn404WhenUpdatingNonExistingEmployee()
            throws Exception {

        Employee employee = new Employee(
                null,
                "Test",
                "Employee",
                "test@example.com",
                "9876543210",
                "Testing"
        );

        when(employeeService.updateEmployee(
                eq(999L),
                any(Employee.class)))
                .thenThrow(new RuntimeException("Employee not found"));

        mockMvc.perform(put("/api/employees/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employee)))
                .andExpect(status().isNotFound());
    }
    @Test
    void shouldReturn404WhenDeletingNonExistingEmployee()
            throws Exception {

        when(employeeService.getEmployeeById(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/employees/999"))
                .andExpect(status().isNotFound());

        verify(employeeService, never())
                .deleteEmployee(999L);
    }
    @Test
    void shouldDeleteEmployee() throws Exception {

        Employee employee = new Employee();
        employee.setId(1L);

        when(employeeService.getEmployeeById(1L))
                .thenReturn(Optional.of(employee));

        doNothing()
                .when(employeeService)
                .deleteEmployee(1L);

        mockMvc.perform(delete("/api/employees/1"))
                .andExpect(status().isNoContent());

        verify(employeeService)
                .deleteEmployee(1L);
    }
}